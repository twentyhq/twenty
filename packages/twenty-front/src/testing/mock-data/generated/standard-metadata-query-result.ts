import {
    ObjectMetadataItemsQuery
} from '~/generated-metadata/graphql';

// This file is not designed to be manually edited.
// It's an extract from the dev seeded environment metadata call
// TODO: automate the generation of this file
export const mockedStandardObjectMetadataQueryResult: ObjectMetadataItemsQuery = {
  __typename: 'Query',
  objects: {
        "__typename": "ObjectConnection",
        "pageInfo": {
            "__typename": "PageInfo",
            "hasNextPage": false,
            "hasPreviousPage": false,
            "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
            "endCursor": "YXJyYXljb25uZWN0aW9uOjM1"
        },
        "edges": [
            {
                "__typename": "objectEdge",
                "node": {
                    "__typename": "object",
                    "id": "fa9c493a-8468-4141-807f-5a3999614474",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "cbf2d7d9-ab52-4e46-9844-6213ac2d3cf9",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "eb0fb0b8-7e7d-4348-8319-73a67eb79d8a",
                                    "type": "RICH_TEXT",
                                    "name": "body",
                                    "label": "Body",
                                    "description": "Task body",
                                    "icon": "IconFilePencil",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "97bf4843-5923-4ed3-ad34-e0d2cbccc11e",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "cbf2d7d9-ab52-4e46-9844-6213ac2d3cf9",
                                    "type": "TEXT",
                                    "name": "title",
                                    "label": "Title",
                                    "description": "Task title",
                                    "icon": "IconNotes",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "105f2fdb-0f7b-48bd-aae1-213a82f1dc47",
                                    "type": "ACTOR",
                                    "name": "createdBy",
                                    "label": "Created by",
                                    "description": "The creator of the record",
                                    "icon": "IconCreativeCommonsSa",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": {
                                        "name": "''",
                                        "source": "'MANUAL'"
                                    },
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "33f2c36a-f0ab-4c8c-96c9-14aa6c5bcbe6",
                                    "type": "UUID",
                                    "name": "assigneeId",
                                    "label": "Assignee id (foreign key)",
                                    "description": "Task assignee id foreign key",
                                    "icon": "IconUserCircle",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "7dbf7669-4d8c-4e48-9c56-dfd69a482f36",
                                    "type": "RELATION",
                                    "name": "favorites",
                                    "label": "Favorites",
                                    "description": "Favorites linked to the task",
                                    "icon": "IconHeart",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "5061ab04-b936-4208-a7af-b4778345b463",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "fa9c493a-8468-4141-807f-5a3999614474",
                                            "nameSingular": "task",
                                            "namePlural": "tasks"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "7dbf7669-4d8c-4e48-9c56-dfd69a482f36",
                                            "name": "favorites"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b2417845-c5d5-4d5e-8f6a-5a2eafca2983",
                                            "nameSingular": "favorite",
                                            "namePlural": "favorites"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "e090d1a1-1d77-4fea-bede-0eb8975de414",
                                            "name": "task"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "5bdccc5c-c0bd-406f-90cf-70fce5e7aa2b",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "34c6fe29-1ad7-4e50-911b-ba703f885f8f",
                                    "type": "RELATION",
                                    "name": "timelineActivities",
                                    "label": "Timeline Activities",
                                    "description": "Timeline Activities linked to the task.",
                                    "icon": "IconTimelineEvent",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "d958c7cb-3d66-42f6-9ccd-6a959666032b",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "fa9c493a-8468-4141-807f-5a3999614474",
                                            "nameSingular": "task",
                                            "namePlural": "tasks"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "34c6fe29-1ad7-4e50-911b-ba703f885f8f",
                                            "name": "timelineActivities"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "5bf3d57b-749f-4548-a27d-55ab942be344",
                                            "nameSingular": "timelineActivity",
                                            "namePlural": "timelineActivities"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "ff4136ef-9cfe-4f52-978a-029bb79280ec",
                                            "name": "task"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "3cec8954-237b-426e-a8de-9126f2719407",
                                    "type": "POSITION",
                                    "name": "position",
                                    "label": "Position",
                                    "description": "Task record position",
                                    "icon": "IconHierarchy2",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "344ee139-d470-431c-9d3b-c1a4898d7cf2",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "2a6f6a31-fe1d-47c1-8ab5-d46f628b51a6",
                                    "type": "SELECT",
                                    "name": "status",
                                    "label": "Status",
                                    "description": "Task status",
                                    "icon": "IconCheck",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'TODO'",
                                    "options": [
                                        {
                                            "id": "c1eee1b6-516b-469b-bdd0-a71f1a12a138",
                                            "color": "sky",
                                            "label": "To do",
                                            "value": "TODO",
                                            "position": 0
                                        },
                                        {
                                            "id": "d8107b6d-22dd-4c30-9edf-2a59867f01a0",
                                            "color": "purple",
                                            "label": "In progress",
                                            "value": "IN_PROGESS",
                                            "position": 1
                                        },
                                        {
                                            "id": "1ce5143d-2ffc-429b-a6eb-40dc043e83c6",
                                            "color": "green",
                                            "label": "Done",
                                            "value": "DONE",
                                            "position": 1
                                        }
                                    ],
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "5333fcd6-0794-4c6e-aa91-81129f21df08",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "19416d59-3702-4fc9-b1ed-0950370a356c",
                                    "type": "RELATION",
                                    "name": "taskTargets",
                                    "label": "Relations",
                                    "description": "Task targets",
                                    "icon": "IconArrowUpRight",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "60106b98-28b8-4f6a-9807-9a83ccb171d3",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "fa9c493a-8468-4141-807f-5a3999614474",
                                            "nameSingular": "task",
                                            "namePlural": "tasks"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "19416d59-3702-4fc9-b1ed-0950370a356c",
                                            "name": "taskTargets"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "810794a8-ae9f-4b7a-9b6c-4fdba1fa45bd",
                                            "nameSingular": "taskTarget",
                                            "namePlural": "taskTargets"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "c4e9fc82-f0fd-4c97-845e-6127c34c94f8",
                                            "name": "task"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "1b8ff1ff-514b-4a9e-b404-f23110fe70f8",
                                    "type": "DATE_TIME",
                                    "name": "dueAt",
                                    "label": "Due Date",
                                    "description": "Task due date",
                                    "icon": "IconCalendarEvent",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b06906ec-e4e1-4608-a4d9-1f5045d9ffd7",
                                    "type": "RELATION",
                                    "name": "attachments",
                                    "label": "Attachments",
                                    "description": "Task attachments",
                                    "icon": "IconFileImport",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "caebb919-3ae4-499c-8103-482f2438951a",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "fa9c493a-8468-4141-807f-5a3999614474",
                                            "nameSingular": "task",
                                            "namePlural": "tasks"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "b06906ec-e4e1-4608-a4d9-1f5045d9ffd7",
                                            "name": "attachments"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b6c30b65-7822-4622-800c-5478baf15844",
                                            "nameSingular": "attachment",
                                            "namePlural": "attachments"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "4fb87160-9664-4039-99c3-6bcf66589c15",
                                            "name": "task"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "8bc55e5a-c1d9-4943-b882-20dc6f0d392a",
                                    "type": "RELATION",
                                    "name": "assignee",
                                    "label": "Assignee",
                                    "description": "Task assignee",
                                    "icon": "IconUserCircle",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "64e5ff21-4357-481a-858a-efdc8b61df72",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "fa9c493a-8468-4141-807f-5a3999614474",
                                            "nameSingular": "task",
                                            "namePlural": "tasks"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "8bc55e5a-c1d9-4943-b882-20dc6f0d392a",
                                            "name": "assignee"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "61c73b37-76e6-4b71-a31d-375f57983cba",
                                            "name": "assignedTasks"
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
                    "id": "f253841b-31ef-407b-baa7-a84e9d2fc0ef",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "553cf02f-4044-44ec-b1da-812a8cd54f27",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "ea80c00c-7a51-4cff-af6f-040421127e69",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "e098e97c-e369-4ab6-8f17-a3792307428b",
                                    "type": "TEXT",
                                    "name": "refreshToken",
                                    "label": "Refresh Token",
                                    "description": "Messaging provider refresh token",
                                    "icon": "IconKey",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "bc2ce073-4ee2-4869-bedb-c42a0555f3fa",
                                    "type": "TEXT",
                                    "name": "handleAliases",
                                    "label": "Handle Aliases",
                                    "description": "Handle Aliases",
                                    "icon": "IconMail",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "95553bcb-6408-4029-b6e8-0f2a79e41c1e",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "7bf1c1fe-a367-4a38-9956-2f1e0f504b04",
                                    "type": "RELATION",
                                    "name": "accountOwner",
                                    "label": "Account Owner",
                                    "description": "Account Owner",
                                    "icon": "IconUserCircle",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "f269a78d-1dcf-4807-8623-4dc3bc67c7af",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "f253841b-31ef-407b-baa7-a84e9d2fc0ef",
                                            "nameSingular": "connectedAccount",
                                            "namePlural": "connectedAccounts"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "7bf1c1fe-a367-4a38-9956-2f1e0f504b04",
                                            "name": "accountOwner"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "3fe9a0c1-787a-470b-b722-467d67a1fb9a",
                                            "name": "connectedAccounts"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "3f197aad-8baa-4e22-9644-1cf47d2208d4",
                                    "type": "TEXT",
                                    "name": "provider",
                                    "label": "provider",
                                    "description": "The account provider",
                                    "icon": "IconSettings",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "a54711de-4aaa-41d0-9b04-628ebc242653",
                                    "type": "TEXT",
                                    "name": "lastSyncHistoryId",
                                    "label": "Last sync history ID",
                                    "description": "Last sync history ID",
                                    "icon": "IconHistory",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "c2693ef0-0e3b-4488-ad64-0d0b63b581dc",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "ea7f19cc-bf0b-4629-a2ce-9cba81a97750",
                                    "type": "RELATION",
                                    "name": "calendarChannels",
                                    "label": "Calendar Channels",
                                    "description": "Calendar Channels",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "7cd28af4-cab3-44cb-965f-fd068021f580",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "f253841b-31ef-407b-baa7-a84e9d2fc0ef",
                                            "nameSingular": "connectedAccount",
                                            "namePlural": "connectedAccounts"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "ea7f19cc-bf0b-4629-a2ce-9cba81a97750",
                                            "name": "calendarChannels"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "41e3a1c9-6ae9-49bc-a730-c945ae162bb9",
                                            "nameSingular": "calendarChannel",
                                            "namePlural": "calendarChannels"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "989373b4-99db-4843-959a-88e23340939a",
                                            "name": "connectedAccount"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "971752fb-63fc-4b35-8de7-b88edc43daf7",
                                    "type": "DATE_TIME",
                                    "name": "authFailedAt",
                                    "label": "Auth failed at",
                                    "description": "Auth failed at",
                                    "icon": "IconX",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f76a5a57-9406-41e9-ab7b-08be16756504",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "553cf02f-4044-44ec-b1da-812a8cd54f27",
                                    "type": "TEXT",
                                    "name": "handle",
                                    "label": "handle",
                                    "description": "The account handle (email, username, phone number, etc.)",
                                    "icon": "IconMail",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f4359d1b-9c6c-422f-bf98-54e68aee65e2",
                                    "type": "TEXT",
                                    "name": "accessToken",
                                    "label": "Access Token",
                                    "description": "Messaging provider access token",
                                    "icon": "IconKey",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "57278b68-28a6-474b-9a36-4a675f9a91f9",
                                    "type": "RELATION",
                                    "name": "messageChannels",
                                    "label": "Message Channels",
                                    "description": "Message Channels",
                                    "icon": "IconMessage",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "e44d42b3-c5c1-4f5c-ae38-8cff6ca54039",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "f253841b-31ef-407b-baa7-a84e9d2fc0ef",
                                            "nameSingular": "connectedAccount",
                                            "namePlural": "connectedAccounts"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "57278b68-28a6-474b-9a36-4a675f9a91f9",
                                            "name": "messageChannels"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "ef72f876-9d18-474c-a7c3-7c2363b59db3",
                                            "nameSingular": "messageChannel",
                                            "namePlural": "messageChannels"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "7fb41c2f-68e7-4895-b6b7-76dd64e32ea1",
                                            "name": "connectedAccount"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "05e5e087-55a3-426a-9761-bbb512769d94",
                                    "type": "UUID",
                                    "name": "accountOwnerId",
                                    "label": "Account Owner id (foreign key)",
                                    "description": "Account Owner id foreign key",
                                    "icon": "IconUserCircle",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
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
                    "id": "ef72f876-9d18-474c-a7c3-7c2363b59db3",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "0238530e-8b2d-4bca-a75d-489f1e28a797",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "e526743b-9753-497a-bd28-1441d8d820fb",
                                    "type": "NUMBER",
                                    "name": "throttleFailureCount",
                                    "label": "Throttle Failure Count",
                                    "description": "Throttle Failure Count",
                                    "icon": "IconX",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": 0,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "0238530e-8b2d-4bca-a75d-489f1e28a797",
                                    "type": "TEXT",
                                    "name": "handle",
                                    "label": "Handle",
                                    "description": "Handle",
                                    "icon": "IconAt",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "930384a3-782a-48c6-9880-1faa8696d09c",
                                    "type": "SELECT",
                                    "name": "contactAutoCreationPolicy",
                                    "label": "Contact auto creation policy",
                                    "description": "Automatically create People records when receiving or sending emails",
                                    "icon": "IconUserCircle",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'SENT'",
                                    "options": [
                                        {
                                            "id": "ad419e67-fe23-43ab-ba4c-bffc2b7b72aa",
                                            "color": "green",
                                            "label": "Sent and Received",
                                            "value": "SENT_AND_RECEIVED",
                                            "position": 0
                                        },
                                        {
                                            "id": "1643b001-4f45-4988-9d05-53598fc11b48",
                                            "color": "blue",
                                            "label": "Sent",
                                            "value": "SENT",
                                            "position": 1
                                        },
                                        {
                                            "id": "79d3eb56-50fb-42a8-a566-19c34199e64b",
                                            "color": "red",
                                            "label": "None",
                                            "value": "NONE",
                                            "position": 2
                                        }
                                    ],
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "3666f072-30e2-448d-8757-69d51bcba7c8",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "8eebebb8-e8e5-46c3-8451-08592124cfc8",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "a8eaaa58-1622-412b-903b-e5598c85f0af",
                                    "type": "DATE_TIME",
                                    "name": "syncedAt",
                                    "label": "Last sync date",
                                    "description": "Last sync date",
                                    "icon": "IconHistory",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "edae2bcc-fb4d-4006-bd52-7f1fecd847ea",
                                    "type": "UUID",
                                    "name": "connectedAccountId",
                                    "label": "Connected Account id (foreign key)",
                                    "description": "Connected Account id foreign key",
                                    "icon": "IconUserCircle",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b1235401-1de1-486d-8686-d779fdd1014e",
                                    "type": "BOOLEAN",
                                    "name": "excludeGroupEmails",
                                    "label": "Exclude group emails",
                                    "description": "Exclude group emails",
                                    "icon": "IconUsersGroup",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": true,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "d4b768cb-ad55-40eb-9746-91c85a003663",
                                    "type": "TEXT",
                                    "name": "syncCursor",
                                    "label": "Last sync cursor",
                                    "description": "Last sync cursor",
                                    "icon": "IconHistory",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "041d0967-7060-41dc-9581-492ec2073fab",
                                    "type": "SELECT",
                                    "name": "syncStage",
                                    "label": "Sync stage",
                                    "description": "Sync stage",
                                    "icon": "IconStatusChange",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'FULL_MESSAGE_LIST_FETCH_PENDING'",
                                    "options": [
                                        {
                                            "id": "998af071-4707-42b0-b2a8-e1f4c5e7c52a",
                                            "color": "blue",
                                            "label": "Full messages list fetch pending",
                                            "value": "FULL_MESSAGE_LIST_FETCH_PENDING",
                                            "position": 0
                                        },
                                        {
                                            "id": "04ad6d11-2dda-4cfb-b1ee-8c828da32dd8",
                                            "color": "blue",
                                            "label": "Partial messages list fetch pending",
                                            "value": "PARTIAL_MESSAGE_LIST_FETCH_PENDING",
                                            "position": 1
                                        },
                                        {
                                            "id": "c0af77e9-5218-4fa4-9935-a7c0683ae132",
                                            "color": "orange",
                                            "label": "Messages list fetch ongoing",
                                            "value": "MESSAGE_LIST_FETCH_ONGOING",
                                            "position": 2
                                        },
                                        {
                                            "id": "e963731c-a25b-438a-b0d4-736d50f7c671",
                                            "color": "blue",
                                            "label": "Messages import pending",
                                            "value": "MESSAGES_IMPORT_PENDING",
                                            "position": 3
                                        },
                                        {
                                            "id": "9f0e1cd2-fe2f-423c-832f-fa2116191183",
                                            "color": "orange",
                                            "label": "Messages import ongoing",
                                            "value": "MESSAGES_IMPORT_ONGOING",
                                            "position": 4
                                        },
                                        {
                                            "id": "cc553dcb-4c2f-4ca0-bf82-8d6408873bbc",
                                            "color": "red",
                                            "label": "Failed",
                                            "value": "FAILED",
                                            "position": 5
                                        }
                                    ],
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "79972e50-5af4-444d-a716-ad0ac3c30024",
                                    "type": "SELECT",
                                    "name": "syncStatus",
                                    "label": "Sync status",
                                    "description": "Sync status",
                                    "icon": "IconStatusChange",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": [
                                        {
                                            "id": "b8283bc8-b451-477e-93ba-4cbe19a51bca",
                                            "color": "yellow",
                                            "label": "Ongoing",
                                            "value": "ONGOING",
                                            "position": 1
                                        },
                                        {
                                            "id": "11d09e50-b3ab-4e0e-ba67-2599891b2002",
                                            "color": "blue",
                                            "label": "Not Synced",
                                            "value": "NOT_SYNCED",
                                            "position": 2
                                        },
                                        {
                                            "id": "31b6bbb3-8d55-4c6f-bc18-98cd1d4ee598",
                                            "color": "green",
                                            "label": "Active",
                                            "value": "ACTIVE",
                                            "position": 3
                                        },
                                        {
                                            "id": "50a08eeb-09f0-4aa0-b09c-7cb2fb9f71da",
                                            "color": "red",
                                            "label": "Failed Insufficient Permissions",
                                            "value": "FAILED_INSUFFICIENT_PERMISSIONS",
                                            "position": 4
                                        },
                                        {
                                            "id": "860b7845-67aa-40c2-b400-3cd457a3453b",
                                            "color": "red",
                                            "label": "Failed Unknown",
                                            "value": "FAILED_UNKNOWN",
                                            "position": 5
                                        }
                                    ],
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "08f9098d-2a54-465b-8823-a2cdd8ac74a3",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "8d060ec3-6700-4dc1-8e52-c3c9595c7096",
                                    "type": "SELECT",
                                    "name": "type",
                                    "label": "Type",
                                    "description": "Channel Type",
                                    "icon": "IconMessage",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'email'",
                                    "options": [
                                        {
                                            "id": "d90fd3a0-9778-4ccc-807a-165303e03644",
                                            "color": "green",
                                            "label": "Email",
                                            "value": "email",
                                            "position": 0
                                        },
                                        {
                                            "id": "6db7505f-ad7b-457e-a36c-074c08009100",
                                            "color": "blue",
                                            "label": "SMS",
                                            "value": "sms",
                                            "position": 1
                                        }
                                    ],
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "2bb72bc5-f764-414a-a3fc-0a489f3d4e67",
                                    "type": "BOOLEAN",
                                    "name": "excludeNonProfessionalEmails",
                                    "label": "Exclude non professional emails",
                                    "description": "Exclude non professional emails",
                                    "icon": "IconBriefcase",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": true,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "3f5ea449-070b-4988-9dcf-34fb836e1cbb",
                                    "type": "BOOLEAN",
                                    "name": "isSyncEnabled",
                                    "label": "Is Sync Enabled",
                                    "description": "Is Sync Enabled",
                                    "icon": "IconRefresh",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": true,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "46c09f33-77d6-4e49-b588-07d9e4729f27",
                                    "type": "SELECT",
                                    "name": "visibility",
                                    "label": "Visibility",
                                    "description": "Visibility",
                                    "icon": "IconEyeglass",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'SHARE_EVERYTHING'",
                                    "options": [
                                        {
                                            "id": "027f66b9-ebfe-4b9a-bb49-0da3967e9bb1",
                                            "color": "green",
                                            "label": "Metadata",
                                            "value": "METADATA",
                                            "position": 0
                                        },
                                        {
                                            "id": "3663037d-9dd6-4122-894c-247f59d1366b",
                                            "color": "blue",
                                            "label": "Subject",
                                            "value": "SUBJECT",
                                            "position": 1
                                        },
                                        {
                                            "id": "531e1968-12d2-4ab7-a9a3-2ac0a0cbc87a",
                                            "color": "orange",
                                            "label": "Share Everything",
                                            "value": "SHARE_EVERYTHING",
                                            "position": 2
                                        }
                                    ],
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "a9ef9914-bb1f-4ca3-9ea3-1cabd1155cf0",
                                    "type": "BOOLEAN",
                                    "name": "isContactAutoCreationEnabled",
                                    "label": "Is Contact Auto Creation Enabled",
                                    "description": "Is Contact Auto Creation Enabled",
                                    "icon": "IconUserCircle",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": true,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "260642ba-1198-4a49-850a-d49a1c22ca1d",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "759c84ac-86ef-429a-a329-f85327f7b9bc",
                                    "type": "DATE_TIME",
                                    "name": "syncStageStartedAt",
                                    "label": "Sync stage started at",
                                    "description": "Sync stage started at",
                                    "icon": "IconHistory",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "2a82eba3-ecd2-4d10-b429-ac3fe2f98e12",
                                    "type": "RELATION",
                                    "name": "messageChannelMessageAssociations",
                                    "label": "Message Channel Association",
                                    "description": "Messages from the channel.",
                                    "icon": "IconMessage",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "4845f921-af84-4625-94be-35b3dd11e530",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "ef72f876-9d18-474c-a7c3-7c2363b59db3",
                                            "nameSingular": "messageChannel",
                                            "namePlural": "messageChannels"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "2a82eba3-ecd2-4d10-b429-ac3fe2f98e12",
                                            "name": "messageChannelMessageAssociations"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "ce846485-e54e-4094-9c34-50f0e8dce971",
                                            "nameSingular": "messageChannelMessageAssociation",
                                            "namePlural": "messageChannelMessageAssociations"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "73a15e92-9804-42d5-84e7-91981864f856",
                                            "name": "messageChannel"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "7fb41c2f-68e7-4895-b6b7-76dd64e32ea1",
                                    "type": "RELATION",
                                    "name": "connectedAccount",
                                    "label": "Connected Account",
                                    "description": "Connected Account",
                                    "icon": "IconUserCircle",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "e44d42b3-c5c1-4f5c-ae38-8cff6ca54039",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "ef72f876-9d18-474c-a7c3-7c2363b59db3",
                                            "nameSingular": "messageChannel",
                                            "namePlural": "messageChannels"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "7fb41c2f-68e7-4895-b6b7-76dd64e32ea1",
                                            "name": "connectedAccount"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "f253841b-31ef-407b-baa7-a84e9d2fc0ef",
                                            "nameSingular": "connectedAccount",
                                            "namePlural": "connectedAccounts"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "57278b68-28a6-474b-9a36-4a675f9a91f9",
                                            "name": "messageChannels"
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
                    "id": "e6155188-ccb3-4af9-9a60-9fb387cf19d6",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "12becaef-631c-4c6b-b21d-aa60d83a70e7",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "7cab0fdc-9347-46d6-80c7-d69261206c57",
                                    "type": "TEXT",
                                    "name": "icon",
                                    "label": "Icon",
                                    "description": "View icon",
                                    "icon": null,
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b81f30e8-c238-48ad-b887-1f748ad6c65e",
                                    "type": "TEXT",
                                    "name": "kanbanFieldMetadataId",
                                    "label": "kanbanfieldMetadataId",
                                    "description": "View Kanban column field",
                                    "icon": null,
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "0586c0a0-3f44-4502-bbca-21bbd28c9b8f",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "841bd804-b1b9-41d9-ac5c-70768ee694ed",
                                    "type": "POSITION",
                                    "name": "position",
                                    "label": "Position",
                                    "description": "View position",
                                    "icon": null,
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "55034736-1041-43a1-90c8-d21d3c7962ed",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "12becaef-631c-4c6b-b21d-aa60d83a70e7",
                                    "type": "TEXT",
                                    "name": "name",
                                    "label": "Name",
                                    "description": "View name",
                                    "icon": null,
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "9efcbc1c-5a36-4b83-b272-6136ae17fdf8",
                                    "type": "BOOLEAN",
                                    "name": "isCompact",
                                    "label": "Compact View",
                                    "description": "Describes if the view is in compact mode",
                                    "icon": null,
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": false,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b6e824b8-89c3-4888-8951-518ee5e2bf5b",
                                    "type": "RELATION",
                                    "name": "viewFilters",
                                    "label": "View Filters",
                                    "description": "View Filters",
                                    "icon": "IconFilterBolt",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "2d589b5c-9933-4493-9771-6915edbe1c1f",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "e6155188-ccb3-4af9-9a60-9fb387cf19d6",
                                            "nameSingular": "view",
                                            "namePlural": "views"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "b6e824b8-89c3-4888-8951-518ee5e2bf5b",
                                            "name": "viewFilters"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "0c25904e-f217-4108-a253-47c123d69fe7",
                                            "nameSingular": "viewFilter",
                                            "namePlural": "viewFilters"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "e423f09d-1b9a-4600-b89c-ce42a0a0ec44",
                                            "name": "view"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "db29a9d8-2628-4bb4-958a-61eb620afd01",
                                    "type": "SELECT",
                                    "name": "key",
                                    "label": "Key",
                                    "description": "View key",
                                    "icon": null,
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'INDEX'",
                                    "options": [
                                        {
                                            "id": "36541b8b-b624-4233-8098-8eeedadbc1ab",
                                            "color": "red",
                                            "label": "Index",
                                            "value": "INDEX",
                                            "position": 0
                                        }
                                    ],
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "44c72a59-be1d-4eb2-a34f-fc83de80d4a2",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "4be4ea49-93ac-486c-a477-069727bb7d58",
                                    "type": "RELATION",
                                    "name": "viewFields",
                                    "label": "View Fields",
                                    "description": "View Fields",
                                    "icon": "IconTag",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "b3c9ba61-85fd-4321-863a-8390fe57bcd5",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "e6155188-ccb3-4af9-9a60-9fb387cf19d6",
                                            "nameSingular": "view",
                                            "namePlural": "views"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "4be4ea49-93ac-486c-a477-069727bb7d58",
                                            "name": "viewFields"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "294354c3-3156-446c-92a2-7a89a0f5abc5",
                                            "nameSingular": "viewField",
                                            "namePlural": "viewFields"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "b0035b5b-a7d6-45ce-a2ac-34eb8acb9e5c",
                                            "name": "view"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "6aa2b0ae-8cbd-4377-b3ca-939847263197",
                                    "type": "RELATION",
                                    "name": "viewSorts",
                                    "label": "View Sorts",
                                    "description": "View Sorts",
                                    "icon": "IconArrowsSort",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "6f6e3bb7-b59e-4b7d-a527-e34763c9f8b2",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "e6155188-ccb3-4af9-9a60-9fb387cf19d6",
                                            "nameSingular": "view",
                                            "namePlural": "views"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "6aa2b0ae-8cbd-4377-b3ca-939847263197",
                                            "name": "viewSorts"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "30789ecd-83bc-4bc8-927c-5b34e0418557",
                                            "nameSingular": "viewSort",
                                            "namePlural": "viewSorts"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "a56c5d76-920b-4e5e-b616-83b8af24bc7a",
                                            "name": "view"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "aef004ba-f824-4071-8d5e-859b370dcb59",
                                    "type": "UUID",
                                    "name": "objectMetadataId",
                                    "label": "Object Metadata Id",
                                    "description": "View target object",
                                    "icon": null,
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "6da7cf8a-a51a-498c-92b0-9bec5267b7e8",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b192a5d2-3c67-414f-a97e-846e2e113c00",
                                    "type": "TEXT",
                                    "name": "type",
                                    "label": "Type",
                                    "description": "View type",
                                    "icon": null,
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'table'",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "0549c452-b2d0-45a6-b642-dec8da262ae3",
                                    "type": "RELATION",
                                    "name": "favorites",
                                    "label": "Favorites",
                                    "description": "Favorites linked to the view",
                                    "icon": "IconHeart",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "1b06b852-1cf9-42e5-a3ac-626b7bdc5440",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "e6155188-ccb3-4af9-9a60-9fb387cf19d6",
                                            "nameSingular": "view",
                                            "namePlural": "views"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "0549c452-b2d0-45a6-b642-dec8da262ae3",
                                            "name": "favorites"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b2417845-c5d5-4d5e-8f6a-5a2eafca2983",
                                            "nameSingular": "favorite",
                                            "namePlural": "favorites"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "407b9893-f6b2-4e9d-a062-bcaabb1697c8",
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
                    "id": "df7a3973-337b-4619-a0f3-db487abef303",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "98774e98-3d03-478c-85c6-6e9757678815",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "6487f5a1-cd4a-4d33-a58c-6fcb30ce8936",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "25983f78-ccf6-4646-8925-8dfde3e038ed",
                                    "type": "RELATION",
                                    "name": "activity",
                                    "label": "Activity",
                                    "description": "Comment activity",
                                    "icon": "IconNotes",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "826d0f01-70bc-40ee-90a5-795357bb5246",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "df7a3973-337b-4619-a0f3-db487abef303",
                                            "nameSingular": "comment",
                                            "namePlural": "comments"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "25983f78-ccf6-4646-8925-8dfde3e038ed",
                                            "name": "activity"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "53f58c52-b8d0-4eca-b5de-12be555c9d21",
                                            "nameSingular": "activity",
                                            "namePlural": "activities"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "d5aa5b80-559d-4ae6-9028-56c6c5e14fd2",
                                            "name": "comments"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "19e73a1e-5115-491c-921b-f7c42c758d01",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "c70704c5-e202-4348-bdae-45e5118dbe67",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "a70cf059-6bd9-4d3e-aafc-614d5010120a",
                                    "type": "UUID",
                                    "name": "activityId",
                                    "label": "Activity id (foreign key)",
                                    "description": "Comment activity id foreign key",
                                    "icon": "IconNotes",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "eb47598f-9328-4555-92c5-b474834db8d5",
                                    "type": "UUID",
                                    "name": "authorId",
                                    "label": "Author id (foreign key)",
                                    "description": "Comment author id foreign key",
                                    "icon": "IconCircleUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "98774e98-3d03-478c-85c6-6e9757678815",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "1be83982-c9af-43c4-bf08-a59933a9f076",
                                    "type": "TEXT",
                                    "name": "body",
                                    "label": "Body",
                                    "description": "Comment body",
                                    "icon": "IconLink",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "e670baeb-2b1a-47b3-9fda-1fb8cd8c3ed7",
                                    "type": "RELATION",
                                    "name": "author",
                                    "label": "Author",
                                    "description": "Comment author",
                                    "icon": "IconCircleUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "6d5b421a-82c5-4b68-ba88-64cc4d640336",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "df7a3973-337b-4619-a0f3-db487abef303",
                                            "nameSingular": "comment",
                                            "namePlural": "comments"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "e670baeb-2b1a-47b3-9fda-1fb8cd8c3ed7",
                                            "name": "author"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "e377d65f-963c-4bc3-916f-b23dae7bd3ea",
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
                    "id": "d872697d-ed6a-4e07-9d3a-b43930378048",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "236a0fb7-e57f-4f49-a39e-150e8f2c40aa",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "63e0a2bd-7551-4324-9a24-dcf15fbed4e0",
                                    "type": "UUID",
                                    "name": "workspaceMemberId",
                                    "label": "WorkspaceMember id (foreign key)",
                                    "description": "WorkspaceMember id foreign key",
                                    "icon": "IconCircleUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "e6912cd3-cb35-4f30-a8ac-2fd43f7e397e",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "544ce792-6b72-4afb-803c-ed51b1b7ae9f",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "dcbc459e-4535-4530-ad54-6df06068c7a3",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "236a0fb7-e57f-4f49-a39e-150e8f2c40aa",
                                    "type": "TEXT",
                                    "name": "handle",
                                    "label": "Handle",
                                    "description": "Handle",
                                    "icon": "IconAt",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "1e57e6c3-5f31-4a47-8832-8b921209b92f",
                                    "type": "RELATION",
                                    "name": "workspaceMember",
                                    "label": "WorkspaceMember",
                                    "description": "WorkspaceMember",
                                    "icon": "IconCircleUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "fefbfc90-f91d-453f-8cdd-739fd6dea91a",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "d872697d-ed6a-4e07-9d3a-b43930378048",
                                            "nameSingular": "blocklist",
                                            "namePlural": "blocklists"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "1e57e6c3-5f31-4a47-8832-8b921209b92f",
                                            "name": "workspaceMember"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "f5cf3c77-402e-4d2b-ac64-2ba2f1001e24",
                                            "name": "blocklist"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "0be0707b-ae16-458b-a148-caff999ea34a",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
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
                    "id": "d6c63917-ecc3-4245-8394-61fe04db32f4",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
                    "nameSingular": "workflowRun",
                    "namePlural": "workflowRuns",
                    "labelSingular": "workflowRun",
                    "labelPlural": "WorkflowRuns",
                    "description": "A workflow run",
                    "icon": null,
                    "isCustom": false,
                    "isRemote": false,
                    "isActive": true,
                    "isSystem": true,
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "e28f20e3-4b7e-4f61-acd0-842bd3e49807",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "d45feb46-e91f-467a-9ded-47bd63dbc4e6",
                                    "type": "UUID",
                                    "name": "workflowId",
                                    "label": "Workflow id (foreign key)",
                                    "description": "Workflow linked to the run. id foreign key",
                                    "icon": "IconSettingsAutomation",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "5c9e717c-2770-4e94-baff-255a9de3615d",
                                    "type": "RELATION",
                                    "name": "workflow",
                                    "label": "Workflow",
                                    "description": "Workflow linked to the run.",
                                    "icon": "IconSettingsAutomation",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "27dfbfff-7bdc-4f0c-8e2d-17df3eff661f",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "d6c63917-ecc3-4245-8394-61fe04db32f4",
                                            "nameSingular": "workflowRun",
                                            "namePlural": "workflowRuns"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "5c9e717c-2770-4e94-baff-255a9de3615d",
                                            "name": "workflow"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "70e01911-b789-43b9-b80f-b78b5b64aaba",
                                            "nameSingular": "workflow",
                                            "namePlural": "workflows"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "495e5876-a224-4382-8f85-d94e56bf04d9",
                                            "name": "runs"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "41b4e31b-96df-4e25-b071-7e6b400d2d5e",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "c27c5207-61dd-4909-bd0f-493db72d8e43",
                                    "type": "ACTOR",
                                    "name": "createdBy",
                                    "label": "Created by",
                                    "description": "The creator of the record",
                                    "icon": "IconCreativeCommonsSa",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": {
                                        "name": "''",
                                        "source": "'MANUAL'"
                                    },
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "a0d95891-0a30-47a2-a684-c47f45b61fef",
                                    "type": "SELECT",
                                    "name": "status",
                                    "label": "Workflow run status",
                                    "description": "Workflow run status",
                                    "icon": "IconHistory",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'NOT_STARTED'",
                                    "options": [
                                        {
                                            "id": "95f2243d-e9c5-4e1f-bfe0-7518d5ac45a2",
                                            "color": "grey",
                                            "label": "Not started",
                                            "value": "NOT_STARTED",
                                            "position": 0
                                        },
                                        {
                                            "id": "e9f6cf27-6fa1-4870-a51b-2bb7181ce1a7",
                                            "color": "yellow",
                                            "label": "Running",
                                            "value": "RUNNING",
                                            "position": 1
                                        },
                                        {
                                            "id": "d932bf2b-a650-4ce2-b931-cc7e58b94a9e",
                                            "color": "green",
                                            "label": "Completed",
                                            "value": "COMPLETED",
                                            "position": 2
                                        },
                                        {
                                            "id": "34049a19-ca3a-4f54-9552-b320a8c6848e",
                                            "color": "red",
                                            "label": "Failed",
                                            "value": "FAILED",
                                            "position": 3
                                        }
                                    ],
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "05536208-6317-4045-aaab-4b063cfbd832",
                                    "type": "DATE_TIME",
                                    "name": "endedAt",
                                    "label": "Workflow run ended at",
                                    "description": "Workflow run ended at",
                                    "icon": "IconHistory",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "8071b247-8d3c-4682-81d2-c92a6d16dd14",
                                    "type": "DATE_TIME",
                                    "name": "startedAt",
                                    "label": "Workflow run started at",
                                    "description": "Workflow run started at",
                                    "icon": "IconHistory",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "6782699c-f4d9-4d2c-9acc-a1bdf54c080d",
                                    "type": "RELATION",
                                    "name": "workflowVersion",
                                    "label": "Workflow version",
                                    "description": "Workflow version linked to the run.",
                                    "icon": "IconVersions",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "564e0af2-972d-47e4-be7f-8c2a329bad9f",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "d6c63917-ecc3-4245-8394-61fe04db32f4",
                                            "nameSingular": "workflowRun",
                                            "namePlural": "workflowRuns"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "6782699c-f4d9-4d2c-9acc-a1bdf54c080d",
                                            "name": "workflowVersion"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "3cab3e59-fe91-4a3a-89f0-73cc1931af3e",
                                            "nameSingular": "workflowVersion",
                                            "namePlural": "workflowVersions"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "050c52a7-d049-4847-b091-709f2fae8e0d",
                                            "name": "runs"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "ae2969b1-bbe3-492c-8334-2dbaa2aa074e",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "fb41c06d-8b9c-4cce-925d-47981c45399f",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "e28f20e3-4b7e-4f61-acd0-842bd3e49807",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f0c5729c-92ff-4c39-9966-a8770fcd8a55",
                                    "type": "UUID",
                                    "name": "workflowVersionId",
                                    "label": "Workflow version id (foreign key)",
                                    "description": "Workflow version linked to the run. id foreign key",
                                    "icon": "IconVersions",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
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
                    "id": "ce846485-e54e-4094-9c34-50f0e8dce971",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "907456cb-8bd1-4c6f-9863-7af157613cbf",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "21189fd0-9202-4d00-988f-bdf662c83e19",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "246dab20-2171-4540-9079-b2856047c6a3",
                                    "type": "UUID",
                                    "name": "messageId",
                                    "label": "Message Id id (foreign key)",
                                    "description": "Message Id id foreign key",
                                    "icon": "IconHash",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "72de8fa6-e4bd-4ccf-94e9-bbe2c4ed42a2",
                                    "type": "RELATION",
                                    "name": "message",
                                    "label": "Message Id",
                                    "description": "Message Id",
                                    "icon": "IconHash",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "5d28b08d-81c6-4531-a6de-3820125a5643",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "ce846485-e54e-4094-9c34-50f0e8dce971",
                                            "nameSingular": "messageChannelMessageAssociation",
                                            "namePlural": "messageChannelMessageAssociations"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "72de8fa6-e4bd-4ccf-94e9-bbe2c4ed42a2",
                                            "name": "message"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "0b08226c-bbd9-46e6-aff7-60a8962c78b7",
                                            "nameSingular": "message",
                                            "namePlural": "messages"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "5f47efc7-13c1-4980-89a9-3d2752049c08",
                                            "name": "messageChannelMessageAssociations"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "346ea287-b18b-4542-84f5-871f7834ebe6",
                                    "type": "TEXT",
                                    "name": "messageThreadExternalId",
                                    "label": "Thread External Id",
                                    "description": "Thread id from the messaging provider",
                                    "icon": "IconHash",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "73a15e92-9804-42d5-84e7-91981864f856",
                                    "type": "RELATION",
                                    "name": "messageChannel",
                                    "label": "Message Channel Id",
                                    "description": "Message Channel Id",
                                    "icon": "IconHash",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "4845f921-af84-4625-94be-35b3dd11e530",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "ce846485-e54e-4094-9c34-50f0e8dce971",
                                            "nameSingular": "messageChannelMessageAssociation",
                                            "namePlural": "messageChannelMessageAssociations"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "73a15e92-9804-42d5-84e7-91981864f856",
                                            "name": "messageChannel"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "ef72f876-9d18-474c-a7c3-7c2363b59db3",
                                            "nameSingular": "messageChannel",
                                            "namePlural": "messageChannels"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "2a82eba3-ecd2-4d10-b429-ac3fe2f98e12",
                                            "name": "messageChannelMessageAssociations"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "20b0ca85-02ee-43c2-8c1c-e60c0cdb9aad",
                                    "type": "SELECT",
                                    "name": "direction",
                                    "label": "Direction",
                                    "description": "Message Direction",
                                    "icon": "IconDirection",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'INCOMING'",
                                    "options": [
                                        {
                                            "id": "5f527539-5e47-43e8-b4bb-24de165ac803",
                                            "color": "green",
                                            "label": "Incoming",
                                            "value": "INCOMING",
                                            "position": 0
                                        },
                                        {
                                            "id": "3d3dc780-da84-4cdd-a65d-bacb202861ef",
                                            "color": "blue",
                                            "label": "Outgoing",
                                            "value": "OUTGOING",
                                            "position": 1
                                        }
                                    ],
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "de551a2f-613a-4a51-b618-1fd045ce0ff0",
                                    "type": "UUID",
                                    "name": "messageChannelId",
                                    "label": "Message Channel Id id (foreign key)",
                                    "description": "Message Channel Id id foreign key",
                                    "icon": "IconHash",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "907456cb-8bd1-4c6f-9863-7af157613cbf",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "1370d9d4-ffb2-4d3c-ad4f-94490149d34d",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "860b8963-4ca8-44f7-a0dd-b6b2f46c6c7d",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "7a0591db-17ad-4bdc-9ab7-b978f0697ba5",
                                    "type": "TEXT",
                                    "name": "messageExternalId",
                                    "label": "Message External Id",
                                    "description": "Message id from the messaging provider",
                                    "icon": "IconHash",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
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
                    "id": "bf8361ec-642c-4965-8948-84fa0c9aca76",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "f92ce0f6-1755-447c-abbe-612a88c98d90",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "6b6a3087-dcab-424f-abce-1fdc96eb1496",
                                    "type": "RELATION",
                                    "name": "person",
                                    "label": "Person",
                                    "description": "NoteTarget person",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "c6221f2d-e366-425d-a732-7d3740740bd4",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "bf8361ec-642c-4965-8948-84fa0c9aca76",
                                            "nameSingular": "noteTarget",
                                            "namePlural": "noteTargets"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "6b6a3087-dcab-424f-abce-1fdc96eb1496",
                                            "name": "person"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8d5b1e3c-a76c-4171-90e4-fba40f894af9",
                                            "nameSingular": "person",
                                            "namePlural": "people"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "138a7e85-6742-4c98-b2dc-505a431adfcc",
                                            "name": "noteTargets"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f92ce0f6-1755-447c-abbe-612a88c98d90",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "68be8bf0-2ec5-4d92-91ae-11f9341dd9c0",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "a2f7e81f-bca3-42e0-9015-6c23b5ee8eb5",
                                    "type": "RELATION",
                                    "name": "note",
                                    "label": "Note",
                                    "description": "NoteTarget note",
                                    "icon": "IconNotes",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "0f1bb2ab-ea49-4010-9f07-375a6c0545c0",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "bf8361ec-642c-4965-8948-84fa0c9aca76",
                                            "nameSingular": "noteTarget",
                                            "namePlural": "noteTargets"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "a2f7e81f-bca3-42e0-9015-6c23b5ee8eb5",
                                            "name": "note"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "67951275-b5ae-4055-84af-e91c4febbc04",
                                            "nameSingular": "note",
                                            "namePlural": "notes"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "8aee8914-b47b-43be-ab17-d49ca9725160",
                                            "name": "noteTargets"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "03b5a0f6-856e-4582-a58b-18c2ca69e17c",
                                    "type": "UUID",
                                    "name": "companyId",
                                    "label": "Company id (foreign key)",
                                    "description": "NoteTarget company id foreign key",
                                    "icon": "IconBuildingSkyscraper",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "15f202b5-24c7-4051-8d13-e5355b2f9971",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f6ef2369-34da-4965-a3b5-46d2e96f5a85",
                                    "type": "UUID",
                                    "name": "personId",
                                    "label": "Person id (foreign key)",
                                    "description": "NoteTarget person id foreign key",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "9d693b1a-80eb-43ea-9148-b75d6ebe06d1",
                                    "type": "RELATION",
                                    "name": "company",
                                    "label": "Company",
                                    "description": "NoteTarget company",
                                    "icon": "IconBuildingSkyscraper",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "6e69901d-d6be-41cb-9e76-f433cb37e65c",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "bf8361ec-642c-4965-8948-84fa0c9aca76",
                                            "nameSingular": "noteTarget",
                                            "namePlural": "noteTargets"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "9d693b1a-80eb-43ea-9148-b75d6ebe06d1",
                                            "name": "company"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "29fc8ab6-b5fe-4a4c-bc23-2da8cbb5d6c4",
                                            "nameSingular": "company",
                                            "namePlural": "companies"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "06f20ae5-723b-4cd6-9849-a45a1f1cd54b",
                                            "name": "noteTargets"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "7f5f6e1b-b214-4265-a9b6-c09b708cba51",
                                    "type": "UUID",
                                    "name": "noteId",
                                    "label": "Note id (foreign key)",
                                    "description": "NoteTarget note id foreign key",
                                    "icon": "IconNotes",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b57c43c6-1d4c-4681-a398-515b19a46ccc",
                                    "type": "RELATION",
                                    "name": "opportunity",
                                    "label": "Opportunity",
                                    "description": "NoteTarget opportunity",
                                    "icon": "IconTargetArrow",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "7214c6c8-b755-4aa6-aa1e-7bf8a7b297ba",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "bf8361ec-642c-4965-8948-84fa0c9aca76",
                                            "nameSingular": "noteTarget",
                                            "namePlural": "noteTargets"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "b57c43c6-1d4c-4681-a398-515b19a46ccc",
                                            "name": "opportunity"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "814be74c-fe3e-46b9-97db-4c4a61b9cfa7",
                                            "nameSingular": "opportunity",
                                            "namePlural": "opportunities"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "bd62b6b8-ca30-4717-ae2f-203c53b88980",
                                            "name": "noteTargets"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "71f5a00e-ef5e-4354-9738-47d280b1b355",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "da4c4a23-ba8b-4ba9-965e-0908675ccebd",
                                    "type": "UUID",
                                    "name": "opportunityId",
                                    "label": "Opportunity id (foreign key)",
                                    "description": "NoteTarget opportunity id foreign key",
                                    "icon": "IconTargetArrow",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
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
                    "id": "b6c30b65-7822-4622-800c-5478baf15844",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "ec6f5389-cee1-4c8b-8eef-2d5d5ce2fd14",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "4fb87160-9664-4039-99c3-6bcf66589c15",
                                    "type": "RELATION",
                                    "name": "task",
                                    "label": "Task",
                                    "description": "Attachment task",
                                    "icon": "IconNotes",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "caebb919-3ae4-499c-8103-482f2438951a",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b6c30b65-7822-4622-800c-5478baf15844",
                                            "nameSingular": "attachment",
                                            "namePlural": "attachments"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "4fb87160-9664-4039-99c3-6bcf66589c15",
                                            "name": "task"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "fa9c493a-8468-4141-807f-5a3999614474",
                                            "nameSingular": "task",
                                            "namePlural": "tasks"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "b06906ec-e4e1-4608-a4d9-1f5045d9ffd7",
                                            "name": "attachments"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "55b70424-4e5d-4d53-a6e5-b60687107b00",
                                    "type": "RELATION",
                                    "name": "opportunity",
                                    "label": "Opportunity",
                                    "description": "Attachment opportunity",
                                    "icon": "IconBuildingSkyscraper",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "38213d76-d9b0-4ca4-83ee-1739b0c34971",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b6c30b65-7822-4622-800c-5478baf15844",
                                            "nameSingular": "attachment",
                                            "namePlural": "attachments"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "55b70424-4e5d-4d53-a6e5-b60687107b00",
                                            "name": "opportunity"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "814be74c-fe3e-46b9-97db-4c4a61b9cfa7",
                                            "nameSingular": "opportunity",
                                            "namePlural": "opportunities"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "ad6ce24f-2eb4-468b-b4f9-095c3cc27aad",
                                            "name": "attachments"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "d01c53c2-ad69-4252-bc21-aea4d8f4873f",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b980e3f0-04c0-487d-bcec-d5f4ce5914b1",
                                    "type": "UUID",
                                    "name": "taskId",
                                    "label": "Task id (foreign key)",
                                    "description": "Attachment task id foreign key",
                                    "icon": "IconNotes",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "3388bc41-07c0-43d3-9512-cf7fad430e86",
                                    "type": "UUID",
                                    "name": "companyId",
                                    "label": "Company id (foreign key)",
                                    "description": "Attachment company id foreign key",
                                    "icon": "IconBuildingSkyscraper",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "66984896-c820-4488-b1cf-b0844de1e736",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "89455656-0d80-4f28-8b13-920a685bfdca",
                                    "type": "UUID",
                                    "name": "personId",
                                    "label": "Person id (foreign key)",
                                    "description": "Attachment person id foreign key",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "8e292829-b7db-4e13-8f12-104c581dd817",
                                    "type": "UUID",
                                    "name": "authorId",
                                    "label": "Author id (foreign key)",
                                    "description": "Attachment author id foreign key",
                                    "icon": "IconCircleUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "36cc824d-fef5-42d7-bd9d-8bb7f25d3adf",
                                    "type": "TEXT",
                                    "name": "fullPath",
                                    "label": "Full path",
                                    "description": "Attachment full path",
                                    "icon": "IconLink",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "663b05b5-89b1-4832-99e4-0e51d47981db",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f5851131-309a-4d9f-b3e7-04778f31cc96",
                                    "type": "UUID",
                                    "name": "activityId",
                                    "label": "Activity id (foreign key)",
                                    "description": "Attachment activity id foreign key",
                                    "icon": "IconNotes",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "4fe8afc7-3850-4d59-8d75-30566a37a626",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "ec6f5389-cee1-4c8b-8eef-2d5d5ce2fd14",
                                    "type": "TEXT",
                                    "name": "name",
                                    "label": "Name",
                                    "description": "Attachment name",
                                    "icon": "IconFileUpload",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "64087859-832c-40fa-ae7a-7f163ce3e230",
                                    "type": "UUID",
                                    "name": "opportunityId",
                                    "label": "Opportunity id (foreign key)",
                                    "description": "Attachment opportunity id foreign key",
                                    "icon": "IconBuildingSkyscraper",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "255f9ab9-3bc9-42a0-bb8f-2bd0c40245eb",
                                    "type": "RELATION",
                                    "name": "company",
                                    "label": "Company",
                                    "description": "Attachment company",
                                    "icon": "IconBuildingSkyscraper",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "1e57d284-4299-4c9e-8b19-36f9979bf583",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b6c30b65-7822-4622-800c-5478baf15844",
                                            "nameSingular": "attachment",
                                            "namePlural": "attachments"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "255f9ab9-3bc9-42a0-bb8f-2bd0c40245eb",
                                            "name": "company"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "29fc8ab6-b5fe-4a4c-bc23-2da8cbb5d6c4",
                                            "nameSingular": "company",
                                            "namePlural": "companies"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "b83f5915-d57b-4827-8c3e-141c508c2d8f",
                                            "name": "attachments"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "fe90a42a-5c8f-4162-9964-d8d53b8627f0",
                                    "type": "UUID",
                                    "name": "noteId",
                                    "label": "Note id (foreign key)",
                                    "description": "Attachment note id foreign key",
                                    "icon": "IconNotes",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "6cbf6c48-dfa0-4f33-81b1-aadab4d765b4",
                                    "type": "TEXT",
                                    "name": "type",
                                    "label": "Type",
                                    "description": "Attachment type",
                                    "icon": "IconList",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "0c623577-6717-4d70-8d87-da83253483a6",
                                    "type": "RELATION",
                                    "name": "activity",
                                    "label": "Activity",
                                    "description": "Attachment activity",
                                    "icon": "IconNotes",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "4335e402-4e69-4bc9-9cde-6abd737f27c3",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b6c30b65-7822-4622-800c-5478baf15844",
                                            "nameSingular": "attachment",
                                            "namePlural": "attachments"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "0c623577-6717-4d70-8d87-da83253483a6",
                                            "name": "activity"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "53f58c52-b8d0-4eca-b5de-12be555c9d21",
                                            "nameSingular": "activity",
                                            "namePlural": "activities"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "12c73546-009f-47c1-8492-af8b4a9bb2e4",
                                            "name": "attachments"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f1ec1fd6-b904-405c-85ea-6aa8b3ac90a0",
                                    "type": "RELATION",
                                    "name": "person",
                                    "label": "Person",
                                    "description": "Attachment person",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "44245c8a-246e-475c-8604-614548f77eae",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b6c30b65-7822-4622-800c-5478baf15844",
                                            "nameSingular": "attachment",
                                            "namePlural": "attachments"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "f1ec1fd6-b904-405c-85ea-6aa8b3ac90a0",
                                            "name": "person"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8d5b1e3c-a76c-4171-90e4-fba40f894af9",
                                            "nameSingular": "person",
                                            "namePlural": "people"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "6b041674-eb97-4cdc-a408-36bdd5689663",
                                            "name": "attachments"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "a06a9ba3-2312-4c21-b066-80b0652fabd4",
                                    "type": "RELATION",
                                    "name": "note",
                                    "label": "Note",
                                    "description": "Attachment note",
                                    "icon": "IconNotes",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "f37a8e07-69a8-4c9f-b7e3-eecc1691ec56",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b6c30b65-7822-4622-800c-5478baf15844",
                                            "nameSingular": "attachment",
                                            "namePlural": "attachments"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "a06a9ba3-2312-4c21-b066-80b0652fabd4",
                                            "name": "note"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "67951275-b5ae-4055-84af-e91c4febbc04",
                                            "nameSingular": "note",
                                            "namePlural": "notes"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "072399a7-7f87-402a-a534-5f2a86b374c7",
                                            "name": "attachments"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "104aa18c-2eef-4948-b1fd-cb41c1472725",
                                    "type": "RELATION",
                                    "name": "author",
                                    "label": "Author",
                                    "description": "Attachment author",
                                    "icon": "IconCircleUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "814dd3fd-e9c9-499f-b467-ec6d55b31d21",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b6c30b65-7822-4622-800c-5478baf15844",
                                            "nameSingular": "attachment",
                                            "namePlural": "attachments"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "104aa18c-2eef-4948-b1fd-cb41c1472725",
                                            "name": "author"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "614723f8-c510-40d9-92cf-894122df9888",
                                            "name": "authoredAttachments"
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
                    "id": "b2417845-c5d5-4d5e-8f6a-5a2eafca2983",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "6e5b1b28-89ff-4f15-9cb8-ca27948bf52a",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "faf8fa90-a883-49b6-82f5-5441fe30717f",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "407b9893-f6b2-4e9d-a062-bcaabb1697c8",
                                    "type": "RELATION",
                                    "name": "view",
                                    "label": "View",
                                    "description": "Favorite view",
                                    "icon": "IconLayoutCollage",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "1b06b852-1cf9-42e5-a3ac-626b7bdc5440",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b2417845-c5d5-4d5e-8f6a-5a2eafca2983",
                                            "nameSingular": "favorite",
                                            "namePlural": "favorites"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "407b9893-f6b2-4e9d-a062-bcaabb1697c8",
                                            "name": "view"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "e6155188-ccb3-4af9-9a60-9fb387cf19d6",
                                            "nameSingular": "view",
                                            "namePlural": "views"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "0549c452-b2d0-45a6-b642-dec8da262ae3",
                                            "name": "favorites"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "d47bea69-d9fa-4c19-9cfe-ccd4b3ab8deb",
                                    "type": "UUID",
                                    "name": "workflowId",
                                    "label": "Workflow id (foreign key)",
                                    "description": "Favorite workflow id foreign key",
                                    "icon": "IconSettingsAutomation",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f679ea3a-d81b-4d7d-9f09-153848ef873e",
                                    "type": "UUID",
                                    "name": "noteId",
                                    "label": "Note id (foreign key)",
                                    "description": "Favorite note id foreign key",
                                    "icon": "IconNotes",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "5377149e-4f88-4e70-b32e-1acdeb080ddb",
                                    "type": "NUMBER",
                                    "name": "position",
                                    "label": "Position",
                                    "description": "Favorite position",
                                    "icon": "IconList",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": 0,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "eb21368b-38b5-473a-ac44-e47c632b1f9e",
                                    "type": "UUID",
                                    "name": "opportunityId",
                                    "label": "Opportunity id (foreign key)",
                                    "description": "Favorite opportunity id foreign key",
                                    "icon": "IconTargetArrow",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "7e0d6517-b2d5-419b-a058-6f475f13ac28",
                                    "type": "RELATION",
                                    "name": "workflow",
                                    "label": "Workflow",
                                    "description": "Favorite workflow",
                                    "icon": "IconSettingsAutomation",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "79c71cb5-f2da-4af3-a5f3-f1fdcdb30ffe",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b2417845-c5d5-4d5e-8f6a-5a2eafca2983",
                                            "nameSingular": "favorite",
                                            "namePlural": "favorites"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "7e0d6517-b2d5-419b-a058-6f475f13ac28",
                                            "name": "workflow"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "70e01911-b789-43b9-b80f-b78b5b64aaba",
                                            "nameSingular": "workflow",
                                            "namePlural": "workflows"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "2d8f02f2-fc99-4639-8df5-7eadfb8d7935",
                                            "name": "favorites"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "e090d1a1-1d77-4fea-bede-0eb8975de414",
                                    "type": "RELATION",
                                    "name": "task",
                                    "label": "Task",
                                    "description": "Favorite task",
                                    "icon": "IconCheckbox",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "5061ab04-b936-4208-a7af-b4778345b463",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b2417845-c5d5-4d5e-8f6a-5a2eafca2983",
                                            "nameSingular": "favorite",
                                            "namePlural": "favorites"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "e090d1a1-1d77-4fea-bede-0eb8975de414",
                                            "name": "task"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "fa9c493a-8468-4141-807f-5a3999614474",
                                            "nameSingular": "task",
                                            "namePlural": "tasks"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "7dbf7669-4d8c-4e48-9c56-dfd69a482f36",
                                            "name": "favorites"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "1913b5e4-5aa5-44c7-946e-9da93eaf82ff",
                                    "type": "RELATION",
                                    "name": "company",
                                    "label": "Company",
                                    "description": "Favorite company",
                                    "icon": "IconBuildingSkyscraper",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "6666b6e5-1c22-4a77-a949-d122cd740012",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b2417845-c5d5-4d5e-8f6a-5a2eafca2983",
                                            "nameSingular": "favorite",
                                            "namePlural": "favorites"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "1913b5e4-5aa5-44c7-946e-9da93eaf82ff",
                                            "name": "company"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "29fc8ab6-b5fe-4a4c-bc23-2da8cbb5d6c4",
                                            "nameSingular": "company",
                                            "namePlural": "companies"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "84c79ab3-89ab-4247-8cac-5ab0be1c8ba3",
                                            "name": "favorites"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "99fb41cc-2bad-4b2e-acd6-a26461328a73",
                                    "type": "RELATION",
                                    "name": "opportunity",
                                    "label": "Opportunity",
                                    "description": "Favorite opportunity",
                                    "icon": "IconTargetArrow",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "9351f758-c920-425d-a535-9d6c0076234f",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b2417845-c5d5-4d5e-8f6a-5a2eafca2983",
                                            "nameSingular": "favorite",
                                            "namePlural": "favorites"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "99fb41cc-2bad-4b2e-acd6-a26461328a73",
                                            "name": "opportunity"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "814be74c-fe3e-46b9-97db-4c4a61b9cfa7",
                                            "nameSingular": "opportunity",
                                            "namePlural": "opportunities"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "5ef54914-52c7-4ba0-92e6-e9b97ee63c91",
                                            "name": "favorites"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b6dbac38-5e10-4385-b252-2c323ef60ea7",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "86b47c9c-1c99-4ada-ade1-6d1326be048b",
                                    "type": "RELATION",
                                    "name": "workspaceMember",
                                    "label": "Workspace Member",
                                    "description": "Favorite workspace member",
                                    "icon": "IconCircleUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "fd3ecd57-aef0-4cb4-9bc9-0a53f9b2609e",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b2417845-c5d5-4d5e-8f6a-5a2eafca2983",
                                            "nameSingular": "favorite",
                                            "namePlural": "favorites"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "86b47c9c-1c99-4ada-ade1-6d1326be048b",
                                            "name": "workspaceMember"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "c106d789-66e3-4f91-8e03-cc105b2f82f1",
                                            "name": "favorites"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "3b03eca0-a23b-4f82-87cf-da0cf9a24a9e",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "1344e689-ee1d-4df4-b7ce-a5394d1db3e6",
                                    "type": "UUID",
                                    "name": "taskId",
                                    "label": "Task id (foreign key)",
                                    "description": "Favorite task id foreign key",
                                    "icon": "IconCheckbox",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f0a80d10-568d-4d49-bdb3-16bc31498a04",
                                    "type": "UUID",
                                    "name": "viewId",
                                    "label": "View id (foreign key)",
                                    "description": "Favorite view id foreign key",
                                    "icon": "IconLayoutCollage",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "ced8ffee-ab45-49b4-9f95-67c74b6631d8",
                                    "type": "RELATION",
                                    "name": "note",
                                    "label": "Note",
                                    "description": "Favorite note",
                                    "icon": "IconNotes",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "7fe75d84-35e3-4b33-8331-dd4d79daa324",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b2417845-c5d5-4d5e-8f6a-5a2eafca2983",
                                            "nameSingular": "favorite",
                                            "namePlural": "favorites"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "ced8ffee-ab45-49b4-9f95-67c74b6631d8",
                                            "name": "note"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "67951275-b5ae-4055-84af-e91c4febbc04",
                                            "nameSingular": "note",
                                            "namePlural": "notes"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "33c09cee-eda4-40c5-9c34-2b307d58ffb2",
                                            "name": "favorites"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "2ae0e53a-e5ff-4786-9d68-98eb7f5fdb51",
                                    "type": "RELATION",
                                    "name": "person",
                                    "label": "Person",
                                    "description": "Favorite person",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "dd880fe7-4611-4ec0-be5f-fa790cb66f61",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b2417845-c5d5-4d5e-8f6a-5a2eafca2983",
                                            "nameSingular": "favorite",
                                            "namePlural": "favorites"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "2ae0e53a-e5ff-4786-9d68-98eb7f5fdb51",
                                            "name": "person"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8d5b1e3c-a76c-4171-90e4-fba40f894af9",
                                            "nameSingular": "person",
                                            "namePlural": "people"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "f5517af8-4022-4fff-b32b-006a75db0581",
                                            "name": "favorites"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "949b56c8-92dd-4d4b-a054-b1c27b9e1ea6",
                                    "type": "UUID",
                                    "name": "workspaceMemberId",
                                    "label": "Workspace Member id (foreign key)",
                                    "description": "Favorite workspace member id foreign key",
                                    "icon": "IconCircleUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "6e5b1b28-89ff-4f15-9cb8-ca27948bf52a",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "0a40c362-cc00-4333-93df-aba55e39dc04",
                                    "type": "UUID",
                                    "name": "personId",
                                    "label": "Person id (foreign key)",
                                    "description": "Favorite person id foreign key",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "92535a3b-c03f-47ff-9e6b-b81ef5ac2f14",
                                    "type": "UUID",
                                    "name": "companyId",
                                    "label": "Company id (foreign key)",
                                    "description": "Favorite company id foreign key",
                                    "icon": "IconBuildingSkyscraper",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
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
                    "id": "a72e2236-9e4f-4c87-86e9-ea0d27755bbd",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "354103b4-58c1-4950-a3d4-be28055946b8",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "4377a41f-a554-4870-99a2-3515138cfc92",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "354103b4-58c1-4950-a3d4-be28055946b8",
                                    "type": "TEXT",
                                    "name": "name",
                                    "label": "Name",
                                    "description": "ApiKey name",
                                    "icon": "IconLink",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "1db73bc6-d399-42ae-92b1-1ffcacec2a27",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "9eae0e34-8ba6-4d99-9bb5-f16e8a22e1d4",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f647d329-2fd4-4e3e-84bf-3439e928cc1f",
                                    "type": "DATE_TIME",
                                    "name": "revokedAt",
                                    "label": "Revocation date",
                                    "description": "ApiKey revocation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "4a9247a3-9436-42a5-9f82-8ef9daf47765",
                                    "type": "DATE_TIME",
                                    "name": "expiresAt",
                                    "label": "Expiration date",
                                    "description": "ApiKey expiration date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "06e9dd07-f7cc-44cf-8b0c-773affcb43b4",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
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
                    "id": "917b273d-1c97-4d02-b69b-215516cb9f70",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "902986f3-c080-4ae3-87af-4eaea7c46b4b",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "7c6ab96a-c0da-484a-8358-6a80a76805c4",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "902986f3-c080-4ae3-87af-4eaea7c46b4b",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "0e9928fc-cdfd-400d-8cde-f7d602d295e7",
                                    "type": "RELATION",
                                    "name": "company",
                                    "label": "Company",
                                    "description": "ActivityTarget company",
                                    "icon": "IconBuildingSkyscraper",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "80e54814-98d1-4050-b55e-a8677bda108c",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "917b273d-1c97-4d02-b69b-215516cb9f70",
                                            "nameSingular": "activityTarget",
                                            "namePlural": "activityTargets"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "0e9928fc-cdfd-400d-8cde-f7d602d295e7",
                                            "name": "company"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "29fc8ab6-b5fe-4a4c-bc23-2da8cbb5d6c4",
                                            "nameSingular": "company",
                                            "namePlural": "companies"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "a497e10c-d2c1-4d60-88a4-108dc659f7b3",
                                            "name": "activityTargets"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "2144b33b-6102-48ef-8bad-bc94646b127b",
                                    "type": "UUID",
                                    "name": "opportunityId",
                                    "label": "Opportunity id (foreign key)",
                                    "description": "ActivityTarget opportunity id foreign key",
                                    "icon": "IconTargetArrow",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "4e77a199-8f89-48d5-bda6-4c2bfa712fd3",
                                    "type": "RELATION",
                                    "name": "activity",
                                    "label": "Activity",
                                    "description": "ActivityTarget activity",
                                    "icon": "IconNotes",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "9270b2dd-a55c-439c-b1d7-f2d6171ee641",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "917b273d-1c97-4d02-b69b-215516cb9f70",
                                            "nameSingular": "activityTarget",
                                            "namePlural": "activityTargets"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "4e77a199-8f89-48d5-bda6-4c2bfa712fd3",
                                            "name": "activity"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "53f58c52-b8d0-4eca-b5de-12be555c9d21",
                                            "nameSingular": "activity",
                                            "namePlural": "activities"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "d2def40e-2eb2-45c3-b2fe-755cd1986722",
                                            "name": "activityTargets"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "3c682ebd-fdab-4e4a-a265-8dfe71671c81",
                                    "type": "UUID",
                                    "name": "activityId",
                                    "label": "Activity id (foreign key)",
                                    "description": "ActivityTarget activity id foreign key",
                                    "icon": "IconNotes",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f8aebb63-b3c1-4dc8-bdb1-3b0c96d93e44",
                                    "type": "RELATION",
                                    "name": "opportunity",
                                    "label": "Opportunity",
                                    "description": "ActivityTarget opportunity",
                                    "icon": "IconTargetArrow",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "b3b548a2-250f-40a4-be55-5a841f46a424",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "917b273d-1c97-4d02-b69b-215516cb9f70",
                                            "nameSingular": "activityTarget",
                                            "namePlural": "activityTargets"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "f8aebb63-b3c1-4dc8-bdb1-3b0c96d93e44",
                                            "name": "opportunity"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "814be74c-fe3e-46b9-97db-4c4a61b9cfa7",
                                            "nameSingular": "opportunity",
                                            "namePlural": "opportunities"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "2708144d-d0a4-4214-ad41-01e702b73fc7",
                                            "name": "activityTargets"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "08723829-c47d-47f8-9318-d8bb0c449960",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "497a135d-e115-45f6-8c5c-ab0ec7fda21d",
                                    "type": "UUID",
                                    "name": "personId",
                                    "label": "Person id (foreign key)",
                                    "description": "ActivityTarget person id foreign key",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "4fd2961a-439a-473a-929c-7c19080af857",
                                    "type": "UUID",
                                    "name": "companyId",
                                    "label": "Company id (foreign key)",
                                    "description": "ActivityTarget company id foreign key",
                                    "icon": "IconBuildingSkyscraper",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "0be6a634-c9d8-4ae0-9157-4038e919dae1",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "af23ed4e-530a-49b0-92cf-3cf8191732e1",
                                    "type": "RELATION",
                                    "name": "person",
                                    "label": "Person",
                                    "description": "ActivityTarget person",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "fc5c991c-7722-498f-8ef2-ab9abd27ff77",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "917b273d-1c97-4d02-b69b-215516cb9f70",
                                            "nameSingular": "activityTarget",
                                            "namePlural": "activityTargets"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "af23ed4e-530a-49b0-92cf-3cf8191732e1",
                                            "name": "person"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8d5b1e3c-a76c-4171-90e4-fba40f894af9",
                                            "nameSingular": "person",
                                            "namePlural": "people"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "ff1cc820-5d49-4463-a0c9-c3583fb99b99",
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
                    "id": "8d5b1e3c-a76c-4171-90e4-fba40f894af9",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "9dec1c72-b263-4b77-88e2-59d0af55acc2",
                    "imageIdentifierFieldMetadataId": "0343dd5e-f503-422d-b02e-e98302985199",
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
                                    "id": "30324d54-b46f-46b4-965b-d27f6ac10e35",
                                    "type": "RELATION",
                                    "name": "company",
                                    "label": "Company",
                                    "description": "Contact’s company",
                                    "icon": "IconBuildingSkyscraper",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "61d4d0e3-9b86-4999-b847-0f1edbeb18ac",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8d5b1e3c-a76c-4171-90e4-fba40f894af9",
                                            "nameSingular": "person",
                                            "namePlural": "people"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "30324d54-b46f-46b4-965b-d27f6ac10e35",
                                            "name": "company"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "29fc8ab6-b5fe-4a4c-bc23-2da8cbb5d6c4",
                                            "nameSingular": "company",
                                            "namePlural": "companies"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "f92133e6-e357-4798-8fb1-45b5ed3520b4",
                                            "name": "people"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "2615a8a8-bc90-4da2-83c2-9ca2bd0ee4e3",
                                    "type": "LINKS",
                                    "name": "xLink",
                                    "label": "X",
                                    "description": "Contact’s X/Twitter account",
                                    "icon": "IconBrandX",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": {
                                        "primaryLinkUrl": "''",
                                        "secondaryLinks": null,
                                        "primaryLinkLabel": "''"
                                    },
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "0343dd5e-f503-422d-b02e-e98302985199",
                                    "type": "TEXT",
                                    "name": "avatarUrl",
                                    "label": "Avatar",
                                    "description": "Contact’s avatar",
                                    "icon": "IconFileUpload",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "138a7e85-6742-4c98-b2dc-505a431adfcc",
                                    "type": "RELATION",
                                    "name": "noteTargets",
                                    "label": "Notes",
                                    "description": "Notes tied to the contact",
                                    "icon": "IconNotes",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "c6221f2d-e366-425d-a732-7d3740740bd4",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8d5b1e3c-a76c-4171-90e4-fba40f894af9",
                                            "nameSingular": "person",
                                            "namePlural": "people"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "138a7e85-6742-4c98-b2dc-505a431adfcc",
                                            "name": "noteTargets"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "bf8361ec-642c-4965-8948-84fa0c9aca76",
                                            "nameSingular": "noteTarget",
                                            "namePlural": "noteTargets"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "6b6a3087-dcab-424f-abce-1fdc96eb1496",
                                            "name": "person"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "a6dd2fc1-384d-40b2-880b-4499dead58d6",
                                    "type": "RELATION",
                                    "name": "timelineActivities",
                                    "label": "Events",
                                    "description": "Events linked to the person",
                                    "icon": "IconTimelineEvent",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "c0452fc5-57c8-4ff7-81ce-cb35912ee073",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8d5b1e3c-a76c-4171-90e4-fba40f894af9",
                                            "nameSingular": "person",
                                            "namePlural": "people"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "a6dd2fc1-384d-40b2-880b-4499dead58d6",
                                            "name": "timelineActivities"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "5bf3d57b-749f-4548-a27d-55ab942be344",
                                            "nameSingular": "timelineActivity",
                                            "namePlural": "timelineActivities"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "83893f00-4e76-4b0f-b173-05fd02d9d906",
                                            "name": "person"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "23d3b09c-a9ca-4a9c-a3ee-571e30644817",
                                    "type": "PHONE",
                                    "name": "whatsapp",
                                    "label": "Whatsapp",
                                    "description": "Contact's Whatsapp Number",
                                    "icon": "IconBrandWhatsapp",
                                    "isCustom": true,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:52:10.373Z",
                                    "updatedAt": "2024-09-20T08:52:10.373Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b1151b81-e01f-4275-acf6-195be042d4a3",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "ff1cc820-5d49-4463-a0c9-c3583fb99b99",
                                    "type": "RELATION",
                                    "name": "activityTargets",
                                    "label": "Activities",
                                    "description": "Activities tied to the contact",
                                    "icon": "IconCheckbox",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "fc5c991c-7722-498f-8ef2-ab9abd27ff77",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8d5b1e3c-a76c-4171-90e4-fba40f894af9",
                                            "nameSingular": "person",
                                            "namePlural": "people"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "ff1cc820-5d49-4463-a0c9-c3583fb99b99",
                                            "name": "activityTargets"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "917b273d-1c97-4d02-b69b-215516cb9f70",
                                            "nameSingular": "activityTarget",
                                            "namePlural": "activityTargets"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "af23ed4e-530a-49b0-92cf-3cf8191732e1",
                                            "name": "person"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "4e5b4ee7-e942-4835-8dc9-32d611dd9b13",
                                    "type": "TEXT",
                                    "name": "city",
                                    "label": "City",
                                    "description": "Contact’s city",
                                    "icon": "IconMap",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "6b041674-eb97-4cdc-a408-36bdd5689663",
                                    "type": "RELATION",
                                    "name": "attachments",
                                    "label": "Attachments",
                                    "description": "Attachments linked to the contact.",
                                    "icon": "IconFileImport",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "44245c8a-246e-475c-8604-614548f77eae",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8d5b1e3c-a76c-4171-90e4-fba40f894af9",
                                            "nameSingular": "person",
                                            "namePlural": "people"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "6b041674-eb97-4cdc-a408-36bdd5689663",
                                            "name": "attachments"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b6c30b65-7822-4622-800c-5478baf15844",
                                            "nameSingular": "attachment",
                                            "namePlural": "attachments"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "f1ec1fd6-b904-405c-85ea-6aa8b3ac90a0",
                                            "name": "person"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "472200e6-8303-4fb4-a2e4-f39474b1750e",
                                    "type": "RELATION",
                                    "name": "messageParticipants",
                                    "label": "Message Participants",
                                    "description": "Message Participants",
                                    "icon": "IconUserCircle",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "bf41eb34-0853-4cab-a537-3ac9c4e5dfdd",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8d5b1e3c-a76c-4171-90e4-fba40f894af9",
                                            "nameSingular": "person",
                                            "namePlural": "people"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "472200e6-8303-4fb4-a2e4-f39474b1750e",
                                            "name": "messageParticipants"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "62c3eae9-09c6-4b98-9266-2d64772914cd",
                                            "nameSingular": "messageParticipant",
                                            "namePlural": "messageParticipants"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "5287ff94-92af-4358-a356-c6a39a3708e2",
                                            "name": "person"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "7316df7d-6974-4235-ad9a-4d049b017a4a",
                                    "type": "MULTI_SELECT",
                                    "name": "workPrefereance",
                                    "label": "Work Preference",
                                    "description": "Person's Work Preference",
                                    "icon": "IconHome",
                                    "isCustom": true,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:52:10.569Z",
                                    "updatedAt": "2024-09-20T08:52:10.569Z",
                                    "defaultValue": null,
                                    "options": [
                                        {
                                            "id": "78569242-1016-41ae-9d60-8b0d72d86821",
                                            "color": "green",
                                            "label": "On-Site",
                                            "value": "ON_SITE",
                                            "position": 0
                                        },
                                        {
                                            "id": "45489e0b-6b92-428f-9e4b-37d592c0aed9",
                                            "color": "turquoise",
                                            "label": "Hybrid",
                                            "value": "HYBRID",
                                            "position": 1
                                        },
                                        {
                                            "id": "8002f08c-b1e6-4c90-a431-3d9d0d33d108",
                                            "color": "sky",
                                            "label": "Remote Work",
                                            "value": "REMOTE_WORK",
                                            "position": 2
                                        }
                                    ],
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "7d5b27b6-ebe0-4208-9057-a8fa61e11dcd",
                                    "type": "POSITION",
                                    "name": "position",
                                    "label": "Position",
                                    "description": "Person record Position",
                                    "icon": "IconHierarchy2",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "203bd419-66e4-4541-ad59-dcaa0b47d53b",
                                    "type": "TEXT",
                                    "name": "intro",
                                    "label": "Intro",
                                    "description": "Contact's Intro",
                                    "icon": "IconNote",
                                    "isCustom": true,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:52:10.166Z",
                                    "updatedAt": "2024-09-20T08:52:10.166Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "7db8dd0d-3c2c-4d89-be82-6219c8a17bcb",
                                    "type": "TEXT",
                                    "name": "phone",
                                    "label": "Phone",
                                    "description": "Contact’s phone number",
                                    "icon": "IconPhone",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "ec76cfb0-de70-4cfc-bd64-ba877dc20854",
                                    "type": "RELATION",
                                    "name": "calendarEventParticipants",
                                    "label": "Calendar Event Participants",
                                    "description": "Calendar Event Participants",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "0b781662-92fe-496e-9078-d86e912d2eff",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8d5b1e3c-a76c-4171-90e4-fba40f894af9",
                                            "nameSingular": "person",
                                            "namePlural": "people"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "ec76cfb0-de70-4cfc-bd64-ba877dc20854",
                                            "name": "calendarEventParticipants"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "10349622-e659-4f8e-84c6-1ad240fc5d3d",
                                            "nameSingular": "calendarEventParticipant",
                                            "namePlural": "calendarEventParticipants"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "e0322596-3a51-49a0-b36f-ce3e0f5cc495",
                                            "name": "person"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "980ca369-fb6a-41fb-ac1e-e8b000d4fabf",
                                    "type": "RELATION",
                                    "name": "taskTargets",
                                    "label": "Tasks",
                                    "description": "Tasks tied to the contact",
                                    "icon": "IconCheckbox",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "dcc2cd63-586d-4994-a56a-faaeef48b6f9",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8d5b1e3c-a76c-4171-90e4-fba40f894af9",
                                            "nameSingular": "person",
                                            "namePlural": "people"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "980ca369-fb6a-41fb-ac1e-e8b000d4fabf",
                                            "name": "taskTargets"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "810794a8-ae9f-4b7a-9b6c-4fdba1fa45bd",
                                            "nameSingular": "taskTarget",
                                            "namePlural": "taskTargets"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "98969135-5f85-4ff4-a24d-b485776fb713",
                                            "name": "person"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f5517af8-4022-4fff-b32b-006a75db0581",
                                    "type": "RELATION",
                                    "name": "favorites",
                                    "label": "Favorites",
                                    "description": "Favorites linked to the contact",
                                    "icon": "IconHeart",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "dd880fe7-4611-4ec0-be5f-fa790cb66f61",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8d5b1e3c-a76c-4171-90e4-fba40f894af9",
                                            "nameSingular": "person",
                                            "namePlural": "people"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "f5517af8-4022-4fff-b32b-006a75db0581",
                                            "name": "favorites"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b2417845-c5d5-4d5e-8f6a-5a2eafca2983",
                                            "nameSingular": "favorite",
                                            "namePlural": "favorites"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "2ae0e53a-e5ff-4786-9d68-98eb7f5fdb51",
                                            "name": "person"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "53858c8e-1769-44c1-a896-ea78e6f8d902",
                                    "type": "LINKS",
                                    "name": "linkedinLink",
                                    "label": "Linkedin",
                                    "description": "Contact’s Linkedin account",
                                    "icon": "IconBrandLinkedin",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": {
                                        "primaryLinkUrl": "''",
                                        "secondaryLinks": null,
                                        "primaryLinkLabel": "''"
                                    },
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "953c9cff-f26a-46fc-a781-c3a16f1892ef",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "9dec1c72-b263-4b77-88e2-59d0af55acc2",
                                    "type": "FULL_NAME",
                                    "name": "name",
                                    "label": "Name",
                                    "description": "Contact’s name",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": {
                                        "lastName": "''",
                                        "firstName": "''"
                                    },
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "e9613e64-02e8-4b07-85a3-c437852a3947",
                                    "type": "RELATION",
                                    "name": "pointOfContactForOpportunities",
                                    "label": "Linked Opportunities",
                                    "description": "List of opportunities for which that person is the point of contact",
                                    "icon": "IconTargetArrow",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "54f68bd8-635b-4bf8-a815-0d4b79e56cad",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8d5b1e3c-a76c-4171-90e4-fba40f894af9",
                                            "nameSingular": "person",
                                            "namePlural": "people"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "e9613e64-02e8-4b07-85a3-c437852a3947",
                                            "name": "pointOfContactForOpportunities"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "814be74c-fe3e-46b9-97db-4c4a61b9cfa7",
                                            "nameSingular": "opportunity",
                                            "namePlural": "opportunities"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "662a7e35-59d4-4d3c-b820-3e80e961b75c",
                                            "name": "pointOfContact"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "c2a47e91-6bf6-4f51-aeee-d630b463eee2",
                                    "type": "ACTOR",
                                    "name": "createdBy",
                                    "label": "Created by",
                                    "description": "The creator of the record",
                                    "icon": "IconCreativeCommonsSa",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": {
                                        "name": "''",
                                        "source": "'MANUAL'"
                                    },
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "d435db02-8e49-462b-8808-43efff8f5c10",
                                    "type": "EMAILS",
                                    "name": "emails",
                                    "label": "Emails",
                                    "description": "Contact’s Emails",
                                    "icon": "IconMail",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": {
                                        "primaryEmail": "''",
                                        "additionalEmails": null
                                    },
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "67418353-5a31-4ab3-a8ff-98620312dad8",
                                    "type": "RATING",
                                    "name": "performanceRating",
                                    "label": "Performance Rating",
                                    "description": "Person's Performance Rating",
                                    "icon": "IconStars",
                                    "isCustom": true,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:52:10.768Z",
                                    "updatedAt": "2024-09-20T08:52:10.768Z",
                                    "defaultValue": null,
                                    "options": [
                                        {
                                            "id": "a80d98d8-1647-47a4-b7ce-86eb25110dbc",
                                            "label": "1",
                                            "value": "RATING_1",
                                            "position": 0
                                        },
                                        {
                                            "id": "c6f39469-c50c-4348-9fb1-9f9c234626ba",
                                            "label": "2",
                                            "value": "RATING_2",
                                            "position": 1
                                        },
                                        {
                                            "id": "945af5cd-1ded-48c5-94b4-1e9d9dd8affa",
                                            "label": "3",
                                            "value": "RATING_3",
                                            "position": 2
                                        },
                                        {
                                            "id": "f11ff884-ecfe-4c36-b739-1b8e070f14e0",
                                            "label": "4",
                                            "value": "RATING_4",
                                            "position": 3
                                        },
                                        {
                                            "id": "e97e7e12-8c98-4856-ab29-633f3d79916d",
                                            "label": "5",
                                            "value": "RATING_5",
                                            "position": 4
                                        }
                                    ],
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "5493579d-d58a-4352-a23f-32dc4be93473",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "040629f8-5684-4401-ab54-3b3f45e4aa59",
                                    "type": "TEXT",
                                    "name": "jobTitle",
                                    "label": "Job Title",
                                    "description": "Contact’s job title",
                                    "icon": "IconBriefcase",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "0a95d139-4a77-41f1-b5ec-b3f52e9da615",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "fc753b38-03f7-4472-915e-0fa4f2287fbc",
                                    "type": "UUID",
                                    "name": "companyId",
                                    "label": "Company id (foreign key)",
                                    "description": "Contact’s company id foreign key",
                                    "icon": "IconBuildingSkyscraper",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
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
                    "id": "8d33577d-719a-46a0-b176-d7d5c3711db9",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "454ffbca-2d20-4669-9802-9c15ba6d74be",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "dc168834-2299-4c0a-ac4f-221cb7855498",
                                    "type": "RELATION",
                                    "name": "messages",
                                    "label": "Messages",
                                    "description": "Messages from the thread.",
                                    "icon": "IconMessage",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "6f1b6a0c-63ab-42c6-b770-6f160cdb5b25",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8d33577d-719a-46a0-b176-d7d5c3711db9",
                                            "nameSingular": "messageThread",
                                            "namePlural": "messageThreads"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "dc168834-2299-4c0a-ac4f-221cb7855498",
                                            "name": "messages"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "0b08226c-bbd9-46e6-aff7-60a8962c78b7",
                                            "nameSingular": "message",
                                            "namePlural": "messages"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "ab31176e-2186-4642-bb6a-266c0a701f00",
                                            "name": "messageThread"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "454ffbca-2d20-4669-9802-9c15ba6d74be",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "de4c8a1a-4702-4e2d-8fde-553fd5e05541",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "97c00035-4a95-48c1-a30d-d1096935b579",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b567393b-eba0-422b-97f1-29008ebd3137",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
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
                    "id": "8893e25c-d0ea-4a8d-a432-724e021b283c",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "482181b4-a76f-472b-a068-fd25483fe993",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "6474e45a-d6a9-4f4a-9625-c8a1c6231cbd",
                                    "type": "UUID",
                                    "name": "workflowId",
                                    "label": "Workflow id (foreign key)",
                                    "description": "WorkflowEventListener workflow id foreign key",
                                    "icon": "IconSettingsAutomation",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "482181b4-a76f-472b-a068-fd25483fe993",
                                    "type": "TEXT",
                                    "name": "eventName",
                                    "label": "Name",
                                    "description": "The workflow event listener name",
                                    "icon": "IconPhoneCheck",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "bdc9acc9-7e0d-4daa-9f61-1b9b6c0dc63f",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "1fb053da-0d46-45be-93de-7a27b1438d36",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "3ab0916f-99af-4bc4-be13-3f22420efe07",
                                    "type": "RELATION",
                                    "name": "workflow",
                                    "label": "Workflow",
                                    "description": "WorkflowEventListener workflow",
                                    "icon": "IconSettingsAutomation",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "6d7e4dbe-e41e-47e6-80e0-32dd5eb24396",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8893e25c-d0ea-4a8d-a432-724e021b283c",
                                            "nameSingular": "workflowEventListener",
                                            "namePlural": "workflowEventListeners"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "3ab0916f-99af-4bc4-be13-3f22420efe07",
                                            "name": "workflow"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "70e01911-b789-43b9-b80f-b78b5b64aaba",
                                            "nameSingular": "workflow",
                                            "namePlural": "workflows"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "a6928e69-b018-4de1-aa32-4a33a4099cb1",
                                            "name": "eventListeners"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "2df552a4-6bd8-4189-8972-b871d5c7c176",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "115da2bf-673b-4509-b61a-d5832ecf52f6",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
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
                    "id": "814be74c-fe3e-46b9-97db-4c4a61b9cfa7",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "09ab6390-2e3e-4cce-af08-02d51cb80f34",
                    "imageIdentifierFieldMetadataId": null,
                    "fields": {
                        "__typename": "ObjectFieldsConnection",
                        "pageInfo": {
                            "__typename": "PageInfo",
                            "hasNextPage": false,
                            "hasPreviousPage": false,
                            "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                            "endCursor": "YXJyYXljb25uZWN0aW9uOjE5"
                        },
                        "edges": [
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "5ef54914-52c7-4ba0-92e6-e9b97ee63c91",
                                    "type": "RELATION",
                                    "name": "favorites",
                                    "label": "Favorites",
                                    "description": "Favorites linked to the opportunity",
                                    "icon": "IconHeart",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "9351f758-c920-425d-a535-9d6c0076234f",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "814be74c-fe3e-46b9-97db-4c4a61b9cfa7",
                                            "nameSingular": "opportunity",
                                            "namePlural": "opportunities"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "5ef54914-52c7-4ba0-92e6-e9b97ee63c91",
                                            "name": "favorites"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b2417845-c5d5-4d5e-8f6a-5a2eafca2983",
                                            "nameSingular": "favorite",
                                            "namePlural": "favorites"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "99fb41cc-2bad-4b2e-acd6-a26461328a73",
                                            "name": "opportunity"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "07148f95-9007-474f-88c2-056d26ec570f",
                                    "type": "RELATION",
                                    "name": "taskTargets",
                                    "label": "Tasks",
                                    "description": "Tasks tied to the opportunity",
                                    "icon": "IconCheckbox",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "fdad9957-c93d-4076-b539-abccb7071db9",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "814be74c-fe3e-46b9-97db-4c4a61b9cfa7",
                                            "nameSingular": "opportunity",
                                            "namePlural": "opportunities"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "07148f95-9007-474f-88c2-056d26ec570f",
                                            "name": "taskTargets"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "810794a8-ae9f-4b7a-9b6c-4fdba1fa45bd",
                                            "nameSingular": "taskTarget",
                                            "namePlural": "taskTargets"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "f96322eb-0a59-4d48-9b9d-7f309bb93089",
                                            "name": "opportunity"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "ed656551-0e21-43c3-8d61-823b61e9240c",
                                    "type": "CURRENCY",
                                    "name": "amount",
                                    "label": "Amount",
                                    "description": "Opportunity amount",
                                    "icon": "IconCurrencyDollar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": {
                                        "amountMicros": null,
                                        "currencyCode": "''"
                                    },
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "a95851c7-7a97-4490-9246-3bb08a17a36d",
                                    "type": "RELATION",
                                    "name": "company",
                                    "label": "Company",
                                    "description": "Opportunity company",
                                    "icon": "IconBuildingSkyscraper",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "c62a0630-b4aa-41de-8d5f-4b0b61258d17",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "814be74c-fe3e-46b9-97db-4c4a61b9cfa7",
                                            "nameSingular": "opportunity",
                                            "namePlural": "opportunities"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "a95851c7-7a97-4490-9246-3bb08a17a36d",
                                            "name": "company"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "29fc8ab6-b5fe-4a4c-bc23-2da8cbb5d6c4",
                                            "nameSingular": "company",
                                            "namePlural": "companies"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "87a5aad9-f48f-451c-aef2-4872fdb36cd0",
                                            "name": "opportunities"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "08cf7151-61bb-4747-bfff-6593fe0d2dd4",
                                    "type": "UUID",
                                    "name": "companyId",
                                    "label": "Company id (foreign key)",
                                    "description": "Opportunity company id foreign key",
                                    "icon": "IconBuildingSkyscraper",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "662a7e35-59d4-4d3c-b820-3e80e961b75c",
                                    "type": "RELATION",
                                    "name": "pointOfContact",
                                    "label": "Point of Contact",
                                    "description": "Opportunity point of contact",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "54f68bd8-635b-4bf8-a815-0d4b79e56cad",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "814be74c-fe3e-46b9-97db-4c4a61b9cfa7",
                                            "nameSingular": "opportunity",
                                            "namePlural": "opportunities"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "662a7e35-59d4-4d3c-b820-3e80e961b75c",
                                            "name": "pointOfContact"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8d5b1e3c-a76c-4171-90e4-fba40f894af9",
                                            "nameSingular": "person",
                                            "namePlural": "people"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "e9613e64-02e8-4b07-85a3-c437852a3947",
                                            "name": "pointOfContactForOpportunities"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "ad6ce24f-2eb4-468b-b4f9-095c3cc27aad",
                                    "type": "RELATION",
                                    "name": "attachments",
                                    "label": "Attachments",
                                    "description": "Attachments linked to the opportunity",
                                    "icon": "IconFileImport",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "38213d76-d9b0-4ca4-83ee-1739b0c34971",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "814be74c-fe3e-46b9-97db-4c4a61b9cfa7",
                                            "nameSingular": "opportunity",
                                            "namePlural": "opportunities"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "ad6ce24f-2eb4-468b-b4f9-095c3cc27aad",
                                            "name": "attachments"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b6c30b65-7822-4622-800c-5478baf15844",
                                            "nameSingular": "attachment",
                                            "namePlural": "attachments"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "55b70424-4e5d-4d53-a6e5-b60687107b00",
                                            "name": "opportunity"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "d47c8ff4-87e0-48eb-b0ab-0c8c83f58861",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "d9d492c7-fc7d-4760-a6b8-92d729573a7b",
                                    "type": "RELATION",
                                    "name": "timelineActivities",
                                    "label": "Timeline Activities",
                                    "description": "Timeline Activities linked to the opportunity.",
                                    "icon": "IconTimelineEvent",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "264b1121-d996-4cbd-88e2-360b1a657b66",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "814be74c-fe3e-46b9-97db-4c4a61b9cfa7",
                                            "nameSingular": "opportunity",
                                            "namePlural": "opportunities"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "d9d492c7-fc7d-4760-a6b8-92d729573a7b",
                                            "name": "timelineActivities"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "5bf3d57b-749f-4548-a27d-55ab942be344",
                                            "nameSingular": "timelineActivity",
                                            "namePlural": "timelineActivities"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "65c81619-f527-427f-a384-fde5ab3cd20f",
                                            "name": "opportunity"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "6bb3eee4-1243-44aa-b8e5-2f935085021f",
                                    "type": "SELECT",
                                    "name": "stage",
                                    "label": "Stage",
                                    "description": "Opportunity stage",
                                    "icon": "IconProgressCheck",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'NEW'",
                                    "options": [
                                        {
                                            "id": "1b777e93-399b-44c7-8e67-58b9a79a9932",
                                            "color": "red",
                                            "label": "New",
                                            "value": "NEW",
                                            "position": 0
                                        },
                                        {
                                            "id": "20b9c9d1-1f35-46fb-bfcf-e3ee87d2be66",
                                            "color": "purple",
                                            "label": "Screening",
                                            "value": "SCREENING",
                                            "position": 1
                                        },
                                        {
                                            "id": "ee1d1661-d890-473f-b09f-f7ec679936c5",
                                            "color": "sky",
                                            "label": "Meeting",
                                            "value": "MEETING",
                                            "position": 2
                                        },
                                        {
                                            "id": "eb9d0192-4e5a-4fe8-acf6-ec1c5bf4fe17",
                                            "color": "turquoise",
                                            "label": "Proposal",
                                            "value": "PROPOSAL",
                                            "position": 3
                                        },
                                        {
                                            "id": "6d8a6a4a-d521-4cdd-8984-3b182bcf422c",
                                            "color": "yellow",
                                            "label": "Customer",
                                            "value": "CUSTOMER",
                                            "position": 4
                                        }
                                    ],
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "bd62b6b8-ca30-4717-ae2f-203c53b88980",
                                    "type": "RELATION",
                                    "name": "noteTargets",
                                    "label": "Notes",
                                    "description": "Notes tied to the opportunity",
                                    "icon": "IconNotes",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "7214c6c8-b755-4aa6-aa1e-7bf8a7b297ba",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "814be74c-fe3e-46b9-97db-4c4a61b9cfa7",
                                            "nameSingular": "opportunity",
                                            "namePlural": "opportunities"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "bd62b6b8-ca30-4717-ae2f-203c53b88980",
                                            "name": "noteTargets"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "bf8361ec-642c-4965-8948-84fa0c9aca76",
                                            "nameSingular": "noteTarget",
                                            "namePlural": "noteTargets"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "b57c43c6-1d4c-4681-a398-515b19a46ccc",
                                            "name": "opportunity"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "09ab6390-2e3e-4cce-af08-02d51cb80f34",
                                    "type": "TEXT",
                                    "name": "name",
                                    "label": "Name",
                                    "description": "The opportunity name",
                                    "icon": "IconTargetArrow",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "4c6bbf40-1a94-4b3e-a764-252958157800",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "d13139ca-71c6-4702-8732-d30f99c048f0",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f4ce0d44-f846-4b8c-8e96-e244dcf2eabe",
                                    "type": "UUID",
                                    "name": "pointOfContactId",
                                    "label": "Point of Contact id (foreign key)",
                                    "description": "Opportunity point of contact id foreign key",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "a642c1c1-0a1a-46b2-827d-19cbe76f13c1",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f0f91379-fdbe-457f-8e69-8b48bb5411b2",
                                    "type": "DATE_TIME",
                                    "name": "closeDate",
                                    "label": "Close date",
                                    "description": "Opportunity close date",
                                    "icon": "IconCalendarEvent",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "2708144d-d0a4-4214-ad41-01e702b73fc7",
                                    "type": "RELATION",
                                    "name": "activityTargets",
                                    "label": "Activities",
                                    "description": "Activities tied to the opportunity",
                                    "icon": "IconCheckbox",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "b3b548a2-250f-40a4-be55-5a841f46a424",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "814be74c-fe3e-46b9-97db-4c4a61b9cfa7",
                                            "nameSingular": "opportunity",
                                            "namePlural": "opportunities"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "2708144d-d0a4-4214-ad41-01e702b73fc7",
                                            "name": "activityTargets"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "917b273d-1c97-4d02-b69b-215516cb9f70",
                                            "nameSingular": "activityTarget",
                                            "namePlural": "activityTargets"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "f8aebb63-b3c1-4dc8-bdb1-3b0c96d93e44",
                                            "name": "opportunity"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "48eeac67-5cf1-4c5f-a2cd-bc353f3166f0",
                                    "type": "ACTOR",
                                    "name": "createdBy",
                                    "label": "Created by",
                                    "description": "The creator of the record",
                                    "icon": "IconCreativeCommonsSa",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": {
                                        "name": "''",
                                        "source": "'MANUAL'"
                                    },
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "68d2352a-6340-4bb5-9ada-cfcc1ea01969",
                                    "type": "POSITION",
                                    "name": "position",
                                    "label": "Position",
                                    "description": "Opportunity record position",
                                    "icon": "IconHierarchy2",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
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
                    "id": "810794a8-ae9f-4b7a-9b6c-4fdba1fa45bd",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "7330951e-952a-45c0-b86c-515ecfc341cc",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "98969135-5f85-4ff4-a24d-b485776fb713",
                                    "type": "RELATION",
                                    "name": "person",
                                    "label": "Person",
                                    "description": "TaskTarget person",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "dcc2cd63-586d-4994-a56a-faaeef48b6f9",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "810794a8-ae9f-4b7a-9b6c-4fdba1fa45bd",
                                            "nameSingular": "taskTarget",
                                            "namePlural": "taskTargets"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "98969135-5f85-4ff4-a24d-b485776fb713",
                                            "name": "person"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8d5b1e3c-a76c-4171-90e4-fba40f894af9",
                                            "nameSingular": "person",
                                            "namePlural": "people"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "980ca369-fb6a-41fb-ac1e-e8b000d4fabf",
                                            "name": "taskTargets"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f96322eb-0a59-4d48-9b9d-7f309bb93089",
                                    "type": "RELATION",
                                    "name": "opportunity",
                                    "label": "Opportunity",
                                    "description": "TaskTarget opportunity",
                                    "icon": "IconTargetArrow",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "fdad9957-c93d-4076-b539-abccb7071db9",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "810794a8-ae9f-4b7a-9b6c-4fdba1fa45bd",
                                            "nameSingular": "taskTarget",
                                            "namePlural": "taskTargets"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "f96322eb-0a59-4d48-9b9d-7f309bb93089",
                                            "name": "opportunity"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "814be74c-fe3e-46b9-97db-4c4a61b9cfa7",
                                            "nameSingular": "opportunity",
                                            "namePlural": "opportunities"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "07148f95-9007-474f-88c2-056d26ec570f",
                                            "name": "taskTargets"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "3861e09b-e1b9-4258-bf9f-783551bbee73",
                                    "type": "RELATION",
                                    "name": "company",
                                    "label": "Company",
                                    "description": "TaskTarget company",
                                    "icon": "IconBuildingSkyscraper",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "a080e416-7644-4983-a819-acc69a96c211",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "810794a8-ae9f-4b7a-9b6c-4fdba1fa45bd",
                                            "nameSingular": "taskTarget",
                                            "namePlural": "taskTargets"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "3861e09b-e1b9-4258-bf9f-783551bbee73",
                                            "name": "company"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "29fc8ab6-b5fe-4a4c-bc23-2da8cbb5d6c4",
                                            "nameSingular": "company",
                                            "namePlural": "companies"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "37d7e430-20d9-4a47-89b4-df4b2e058f86",
                                            "name": "taskTargets"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "ca9a981c-6935-4157-87db-891cf50ebc04",
                                    "type": "UUID",
                                    "name": "companyId",
                                    "label": "Company id (foreign key)",
                                    "description": "TaskTarget company id foreign key",
                                    "icon": "IconBuildingSkyscraper",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "5ace7ae9-59c0-478c-8a50-251cfc4581bd",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "773f1978-2620-4267-95e0-37be6b12c8b6",
                                    "type": "UUID",
                                    "name": "opportunityId",
                                    "label": "Opportunity id (foreign key)",
                                    "description": "TaskTarget opportunity id foreign key",
                                    "icon": "IconTargetArrow",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "2f95d5b4-7e55-4603-a840-c207bb13940c",
                                    "type": "UUID",
                                    "name": "personId",
                                    "label": "Person id (foreign key)",
                                    "description": "TaskTarget person id foreign key",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "49cc34cc-bd8f-4e9b-925b-dd38e3395906",
                                    "type": "UUID",
                                    "name": "taskId",
                                    "label": "Task id (foreign key)",
                                    "description": "TaskTarget task id foreign key",
                                    "icon": "IconCheckbox",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "6286ccbc-04ae-4cd6-aca0-a0a61690c4b1",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "e8a3cd70-ecd0-493e-bc9a-886792852a8c",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "c4e9fc82-f0fd-4c97-845e-6127c34c94f8",
                                    "type": "RELATION",
                                    "name": "task",
                                    "label": "Task",
                                    "description": "TaskTarget task",
                                    "icon": "IconCheckbox",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "60106b98-28b8-4f6a-9807-9a83ccb171d3",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "810794a8-ae9f-4b7a-9b6c-4fdba1fa45bd",
                                            "nameSingular": "taskTarget",
                                            "namePlural": "taskTargets"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "c4e9fc82-f0fd-4c97-845e-6127c34c94f8",
                                            "name": "task"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "fa9c493a-8468-4141-807f-5a3999614474",
                                            "nameSingular": "task",
                                            "namePlural": "tasks"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "19416d59-3702-4fc9-b1ed-0950370a356c",
                                            "name": "taskTargets"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "7330951e-952a-45c0-b86c-515ecfc341cc",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
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
                    "id": "7d340e2b-eddb-4b31-96b5-c9812d2f5742",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "581d2aee-05ed-4461-a988-09e64dc3cc30",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "c76f11c4-9f62-44ad-91a3-5ed9c1934224",
                                    "type": "TEXT",
                                    "name": "eventExternalId",
                                    "label": "Event external ID",
                                    "description": "Event external ID",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "13d868b5-2454-4c0b-84d5-8df7160b51b3",
                                    "type": "UUID",
                                    "name": "calendarEventId",
                                    "label": "Event ID id (foreign key)",
                                    "description": "Event ID id foreign key",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "ad742259-7026-457d-9238-03b72d159903",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "c11a651e-cbb6-48ed-a2d8-741decc1d635",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "8ae7cc81-7621-4eb8-9973-5098e9a8bdb1",
                                    "type": "UUID",
                                    "name": "calendarChannelId",
                                    "label": "Channel ID id (foreign key)",
                                    "description": "Channel ID id foreign key",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "2b2208d0-bca4-4b70-95c8-9a73ac3ae90e",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "197079cb-04e8-4926-9903-064af7701893",
                                    "type": "RELATION",
                                    "name": "calendarEvent",
                                    "label": "Event ID",
                                    "description": "Event ID",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "78b72b79-8d1f-4f5b-b36c-0caf4f043918",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "7d340e2b-eddb-4b31-96b5-c9812d2f5742",
                                            "nameSingular": "calendarChannelEventAssociation",
                                            "namePlural": "calendarChannelEventAssociations"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "197079cb-04e8-4926-9903-064af7701893",
                                            "name": "calendarEvent"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "77ca5b71-cf5b-45a4-8235-785f2516038c",
                                            "nameSingular": "calendarEvent",
                                            "namePlural": "calendarEvents"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "daa29431-90a0-42aa-8855-f4eee49db608",
                                            "name": "calendarChannelEventAssociations"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "be6ec181-e215-4a45-ba60-f61878c67d44",
                                    "type": "RELATION",
                                    "name": "calendarChannel",
                                    "label": "Channel ID",
                                    "description": "Channel ID",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "9a6f8a86-74bb-428d-80e6-54605fa95060",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "7d340e2b-eddb-4b31-96b5-c9812d2f5742",
                                            "nameSingular": "calendarChannelEventAssociation",
                                            "namePlural": "calendarChannelEventAssociations"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "be6ec181-e215-4a45-ba60-f61878c67d44",
                                            "name": "calendarChannel"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "41e3a1c9-6ae9-49bc-a730-c945ae162bb9",
                                            "nameSingular": "calendarChannel",
                                            "namePlural": "calendarChannels"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "fe9bf24e-a569-4a8f-9417-ca24d624c7b5",
                                            "name": "calendarChannelEventAssociations"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "581d2aee-05ed-4461-a988-09e64dc3cc30",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
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
                    "id": "77ca5b71-cf5b-45a4-8235-785f2516038c",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "7513be30-38b7-4e9d-8a81-4dc1127ef163",
                    "imageIdentifierFieldMetadataId": null,
                    "fields": {
                        "__typename": "ObjectFieldsConnection",
                        "pageInfo": {
                            "__typename": "PageInfo",
                            "hasNextPage": false,
                            "hasPreviousPage": false,
                            "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                            "endCursor": "YXJyYXljb25uZWN0aW9uOjE4"
                        },
                        "edges": [
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "daa29431-90a0-42aa-8855-f4eee49db608",
                                    "type": "RELATION",
                                    "name": "calendarChannelEventAssociations",
                                    "label": "Calendar Channel Event Associations",
                                    "description": "Calendar Channel Event Associations",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "78b72b79-8d1f-4f5b-b36c-0caf4f043918",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "77ca5b71-cf5b-45a4-8235-785f2516038c",
                                            "nameSingular": "calendarEvent",
                                            "namePlural": "calendarEvents"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "daa29431-90a0-42aa-8855-f4eee49db608",
                                            "name": "calendarChannelEventAssociations"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "7d340e2b-eddb-4b31-96b5-c9812d2f5742",
                                            "nameSingular": "calendarChannelEventAssociation",
                                            "namePlural": "calendarChannelEventAssociations"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "197079cb-04e8-4926-9903-064af7701893",
                                            "name": "calendarEvent"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "e9531d50-19df-4f74-8e99-77651ab55f00",
                                    "type": "DATE_TIME",
                                    "name": "startsAt",
                                    "label": "Start Date",
                                    "description": "Start Date",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "edc7e66f-446f-400c-91c4-0349731701b3",
                                    "type": "TEXT",
                                    "name": "location",
                                    "label": "Location",
                                    "description": "Location",
                                    "icon": "IconMapPin",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "d8522026-43a4-48a9-8ceb-6341b9914dda",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b3cb5d83-1ee2-4b0a-8277-e10f4ec66a22",
                                    "type": "DATE_TIME",
                                    "name": "externalUpdatedAt",
                                    "label": "Update DateTime",
                                    "description": "Update DateTime",
                                    "icon": "IconCalendarCog",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "e84fbf86-0ddd-4898-9d94-53f444474744",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "0a39146d-9c28-4c79-a5c1-1668c22c3ab1",
                                    "type": "TEXT",
                                    "name": "description",
                                    "label": "Description",
                                    "description": "Description",
                                    "icon": "IconFileDescription",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "cedf59f3-6de5-4794-b669-531dff1f4b96",
                                    "type": "TEXT",
                                    "name": "iCalUID",
                                    "label": "iCal UID",
                                    "description": "iCal UID",
                                    "icon": "IconKey",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "69499506-0fd4-4925-ae15-3189f4d76873",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b2e122f6-7aa8-4344-869a-31dd1a1ac393",
                                    "type": "RELATION",
                                    "name": "calendarEventParticipants",
                                    "label": "Event Participants",
                                    "description": "Event Participants",
                                    "icon": "IconUserCircle",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "307a8ea7-0293-458d-80e7-3d5fed101c6f",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "77ca5b71-cf5b-45a4-8235-785f2516038c",
                                            "nameSingular": "calendarEvent",
                                            "namePlural": "calendarEvents"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "b2e122f6-7aa8-4344-869a-31dd1a1ac393",
                                            "name": "calendarEventParticipants"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "10349622-e659-4f8e-84c6-1ad240fc5d3d",
                                            "nameSingular": "calendarEventParticipant",
                                            "namePlural": "calendarEventParticipants"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "8fee3e0f-d886-4ec7-b39d-64c9f61ac6fc",
                                            "name": "calendarEvent"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "a1742f80-b356-4859-a06d-7e72d3d891ce",
                                    "type": "DATE_TIME",
                                    "name": "externalCreatedAt",
                                    "label": "Creation DateTime",
                                    "description": "Creation DateTime",
                                    "icon": "IconCalendarPlus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "d2073a21-e439-4fac-a297-5fd12bb1acc4",
                                    "type": "TEXT",
                                    "name": "conferenceSolution",
                                    "label": "Conference Solution",
                                    "description": "Conference Solution",
                                    "icon": "IconScreenShare",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "a8299e89-b50f-457c-a8ea-678c20ea8778",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "44c7e0fe-72ff-4184-8e65-0d0b95c448f9",
                                    "type": "BOOLEAN",
                                    "name": "isCanceled",
                                    "label": "Is canceled",
                                    "description": "Is canceled",
                                    "icon": "IconCalendarCancel",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": false,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "42f99513-fe07-4864-850d-1e2b18d5e50f",
                                    "type": "TEXT",
                                    "name": "recurringEventExternalId",
                                    "label": "Recurring Event ID",
                                    "description": "Recurring Event ID",
                                    "icon": "IconHistory",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "85e9b34c-4423-4341-a21d-d07b1ce35478",
                                    "type": "BOOLEAN",
                                    "name": "isFullDay",
                                    "label": "Is Full Day",
                                    "description": "Is Full Day",
                                    "icon": "Icon24Hours",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": false,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f7da83b4-4e8b-4f21-829a-7b8e9d0b8010",
                                    "type": "DATE_TIME",
                                    "name": "endsAt",
                                    "label": "End Date",
                                    "description": "End Date",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "7513be30-38b7-4e9d-8a81-4dc1127ef163",
                                    "type": "TEXT",
                                    "name": "title",
                                    "label": "Title",
                                    "description": "Title",
                                    "icon": "IconH1",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "09e98f09-2705-40d0-b9a3-6fd526d54285",
                                    "type": "LINKS",
                                    "name": "conferenceLink",
                                    "label": "Meet Link",
                                    "description": "Meet Link",
                                    "icon": "IconLink",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": {
                                        "primaryLinkUrl": "''",
                                        "secondaryLinks": null,
                                        "primaryLinkLabel": "''"
                                    },
                                    "options": null,
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
                    "id": "70e01911-b789-43b9-b80f-b78b5b64aaba",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "534e4787-576a-48af-a61d-84b7c7127c38",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "534e4787-576a-48af-a61d-84b7c7127c38",
                                    "type": "TEXT",
                                    "name": "name",
                                    "label": "Name",
                                    "description": "The workflow name",
                                    "icon": "IconSettingsAutomation",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "8288f0cc-f190-41ac-ba1f-37cd07697468",
                                    "type": "TEXT",
                                    "name": "lastPublishedVersionId",
                                    "label": "Last published Version Id",
                                    "description": "The workflow last published version id",
                                    "icon": "IconVersions",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "495e5876-a224-4382-8f85-d94e56bf04d9",
                                    "type": "RELATION",
                                    "name": "runs",
                                    "label": "Runs",
                                    "description": "Workflow runs linked to the workflow.",
                                    "icon": "IconVersions",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "27dfbfff-7bdc-4f0c-8e2d-17df3eff661f",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "70e01911-b789-43b9-b80f-b78b5b64aaba",
                                            "nameSingular": "workflow",
                                            "namePlural": "workflows"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "495e5876-a224-4382-8f85-d94e56bf04d9",
                                            "name": "runs"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "d6c63917-ecc3-4245-8394-61fe04db32f4",
                                            "nameSingular": "workflowRun",
                                            "namePlural": "workflowRuns"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "5c9e717c-2770-4e94-baff-255a9de3615d",
                                            "name": "workflow"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "2d8f02f2-fc99-4639-8df5-7eadfb8d7935",
                                    "type": "RELATION",
                                    "name": "favorites",
                                    "label": "Favorites",
                                    "description": "Favorites linked to the contact",
                                    "icon": "IconHeart",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "79c71cb5-f2da-4af3-a5f3-f1fdcdb30ffe",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "70e01911-b789-43b9-b80f-b78b5b64aaba",
                                            "nameSingular": "workflow",
                                            "namePlural": "workflows"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "2d8f02f2-fc99-4639-8df5-7eadfb8d7935",
                                            "name": "favorites"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b2417845-c5d5-4d5e-8f6a-5a2eafca2983",
                                            "nameSingular": "favorite",
                                            "namePlural": "favorites"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "7e0d6517-b2d5-419b-a058-6f475f13ac28",
                                            "name": "workflow"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "8e3cc7c0-ba61-4715-80ad-264889210044",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "ea0d00b7-31bd-425b-a2eb-c0a3a7bcd8f0",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "164b2903-8fad-4a3f-a664-635869417232",
                                    "type": "MULTI_SELECT",
                                    "name": "statuses",
                                    "label": "Statuses",
                                    "description": "The current statuses of the workflow versions",
                                    "icon": null,
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
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
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "7b7d5efa-1ec1-45bf-982c-377ed0d005a7",
                                    "type": "RELATION",
                                    "name": "versions",
                                    "label": "Versions",
                                    "description": "Workflow versions linked to the workflow.",
                                    "icon": "IconVersions",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "3b1485b3-92e5-439e-b2ab-0a48fa4f8fb1",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "70e01911-b789-43b9-b80f-b78b5b64aaba",
                                            "nameSingular": "workflow",
                                            "namePlural": "workflows"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "7b7d5efa-1ec1-45bf-982c-377ed0d005a7",
                                            "name": "versions"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "3cab3e59-fe91-4a3a-89f0-73cc1931af3e",
                                            "nameSingular": "workflowVersion",
                                            "namePlural": "workflowVersions"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "441c7be0-c7ab-47ad-8c8a-7ac2b1b8de40",
                                            "name": "workflow"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b394a632-aec6-4035-8257-d3f0c32e480f",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "c260dfca-789e-4264-ad4a-b748ccc70552",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "a6928e69-b018-4de1-aa32-4a33a4099cb1",
                                    "type": "RELATION",
                                    "name": "eventListeners",
                                    "label": "Event Listeners",
                                    "description": "Workflow event listeners linked to the workflow.",
                                    "icon": "IconVersions",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "6d7e4dbe-e41e-47e6-80e0-32dd5eb24396",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "70e01911-b789-43b9-b80f-b78b5b64aaba",
                                            "nameSingular": "workflow",
                                            "namePlural": "workflows"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "a6928e69-b018-4de1-aa32-4a33a4099cb1",
                                            "name": "eventListeners"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8893e25c-d0ea-4a8d-a432-724e021b283c",
                                            "nameSingular": "workflowEventListener",
                                            "namePlural": "workflowEventListeners"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "3ab0916f-99af-4bc4-be13-3f22420efe07",
                                            "name": "workflow"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "6c372dd2-14ae-4fbb-b738-d62fb5fc21df",
                                    "type": "POSITION",
                                    "name": "position",
                                    "label": "Position",
                                    "description": "Workflow record position",
                                    "icon": "IconHierarchy2",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
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
                    "id": "67951275-b5ae-4055-84af-e91c4febbc04",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "f975da09-2dad-49d3-8c9a-8ea1de2b2edd",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "072399a7-7f87-402a-a534-5f2a86b374c7",
                                    "type": "RELATION",
                                    "name": "attachments",
                                    "label": "Attachments",
                                    "description": "Note attachments",
                                    "icon": "IconFileImport",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "f37a8e07-69a8-4c9f-b7e3-eecc1691ec56",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "67951275-b5ae-4055-84af-e91c4febbc04",
                                            "nameSingular": "note",
                                            "namePlural": "notes"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "072399a7-7f87-402a-a534-5f2a86b374c7",
                                            "name": "attachments"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b6c30b65-7822-4622-800c-5478baf15844",
                                            "nameSingular": "attachment",
                                            "namePlural": "attachments"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "a06a9ba3-2312-4c21-b066-80b0652fabd4",
                                            "name": "note"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "8aee8914-b47b-43be-ab17-d49ca9725160",
                                    "type": "RELATION",
                                    "name": "noteTargets",
                                    "label": "Relations",
                                    "description": "Note targets",
                                    "icon": "IconArrowUpRight",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "0f1bb2ab-ea49-4010-9f07-375a6c0545c0",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "67951275-b5ae-4055-84af-e91c4febbc04",
                                            "nameSingular": "note",
                                            "namePlural": "notes"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "8aee8914-b47b-43be-ab17-d49ca9725160",
                                            "name": "noteTargets"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "bf8361ec-642c-4965-8948-84fa0c9aca76",
                                            "nameSingular": "noteTarget",
                                            "namePlural": "noteTargets"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "a2f7e81f-bca3-42e0-9015-6c23b5ee8eb5",
                                            "name": "note"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "21acdd70-178a-4689-b1bd-898c02d82369",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "33c09cee-eda4-40c5-9c34-2b307d58ffb2",
                                    "type": "RELATION",
                                    "name": "favorites",
                                    "label": "Favorites",
                                    "description": "Favorites linked to the note",
                                    "icon": "IconHeart",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "7fe75d84-35e3-4b33-8331-dd4d79daa324",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "67951275-b5ae-4055-84af-e91c4febbc04",
                                            "nameSingular": "note",
                                            "namePlural": "notes"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "33c09cee-eda4-40c5-9c34-2b307d58ffb2",
                                            "name": "favorites"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b2417845-c5d5-4d5e-8f6a-5a2eafca2983",
                                            "nameSingular": "favorite",
                                            "namePlural": "favorites"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "ced8ffee-ab45-49b4-9f95-67c74b6631d8",
                                            "name": "note"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "ad048306-76bb-4659-84b4-7d21d0d3ec51",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "7cf032cf-7d24-4a57-a701-60698453e3c4",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "945d5cb5-acb0-4aa8-a748-0cff6af72fe8",
                                    "type": "RELATION",
                                    "name": "timelineActivities",
                                    "label": "Timeline Activities",
                                    "description": "Timeline Activities linked to the note.",
                                    "icon": "IconTimelineEvent",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "55ddcb26-fed9-485a-affa-793f46991896",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "67951275-b5ae-4055-84af-e91c4febbc04",
                                            "nameSingular": "note",
                                            "namePlural": "notes"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "945d5cb5-acb0-4aa8-a748-0cff6af72fe8",
                                            "name": "timelineActivities"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "5bf3d57b-749f-4548-a27d-55ab942be344",
                                            "nameSingular": "timelineActivity",
                                            "namePlural": "timelineActivities"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "aad02cd0-6db9-4768-9039-d9678debc438",
                                            "name": "note"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "fee91fef-5b77-4d5e-82bd-9ba580c93a36",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "0d220c24-2e76-425d-81e2-63729410e834",
                                    "type": "ACTOR",
                                    "name": "createdBy",
                                    "label": "Created by",
                                    "description": "The creator of the record",
                                    "icon": "IconCreativeCommonsSa",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": {
                                        "name": "''",
                                        "source": "'MANUAL'"
                                    },
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "c34fd3c8-86d9-4501-81d4-3789893db4ab",
                                    "type": "POSITION",
                                    "name": "position",
                                    "label": "Position",
                                    "description": "Note record position",
                                    "icon": "IconHierarchy2",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "193907de-330a-4bfc-86c2-d95e47c59880",
                                    "type": "RICH_TEXT",
                                    "name": "body",
                                    "label": "Body",
                                    "description": "Note body",
                                    "icon": "IconFilePencil",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f975da09-2dad-49d3-8c9a-8ea1de2b2edd",
                                    "type": "TEXT",
                                    "name": "title",
                                    "label": "Title",
                                    "description": "Note title",
                                    "icon": "IconNotes",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
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
                    "id": "62c3eae9-09c6-4b98-9266-2d64772914cd",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "d911e8aa-d92c-412d-b28d-f1276a158be1",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "81ff16fd-e545-4708-923b-3f46c36a9e04",
                                    "type": "RELATION",
                                    "name": "workspaceMember",
                                    "label": "Workspace Member",
                                    "description": "Workspace member",
                                    "icon": "IconCircleUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "e71ed893-276c-4b6e-bd9c-6d145b2862b3",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "62c3eae9-09c6-4b98-9266-2d64772914cd",
                                            "nameSingular": "messageParticipant",
                                            "namePlural": "messageParticipants"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "81ff16fd-e545-4708-923b-3f46c36a9e04",
                                            "name": "workspaceMember"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "a60ee404-6efa-4bda-99cb-b8f012fd583c",
                                            "name": "messageParticipants"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "51792f6d-1105-429c-8e0e-26243e1caa52",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "d911e8aa-d92c-412d-b28d-f1276a158be1",
                                    "type": "TEXT",
                                    "name": "handle",
                                    "label": "Handle",
                                    "description": "Handle",
                                    "icon": "IconAt",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "9e0ffe91-ffe2-4411-8f58-049b6813bbda",
                                    "type": "TEXT",
                                    "name": "displayName",
                                    "label": "Display Name",
                                    "description": "Display Name",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "94b097dc-95f1-4161-a363-1e4964179d37",
                                    "type": "UUID",
                                    "name": "messageId",
                                    "label": "Message id (foreign key)",
                                    "description": "Message id foreign key",
                                    "icon": "IconMessage",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "a20d1d58-34a5-4a9f-a6ef-292fd5cbcb4f",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "741d55c3-27c2-441f-88fe-0ee2b7a21fbf",
                                    "type": "RELATION",
                                    "name": "message",
                                    "label": "Message",
                                    "description": "Message",
                                    "icon": "IconMessage",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "774cb6b5-f838-40ca-ac38-d864957e8da6",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "62c3eae9-09c6-4b98-9266-2d64772914cd",
                                            "nameSingular": "messageParticipant",
                                            "namePlural": "messageParticipants"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "741d55c3-27c2-441f-88fe-0ee2b7a21fbf",
                                            "name": "message"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "0b08226c-bbd9-46e6-aff7-60a8962c78b7",
                                            "nameSingular": "message",
                                            "namePlural": "messages"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "4271bc4e-06ba-45b0-95ff-4ddfcccb8241",
                                            "name": "messageParticipants"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "5e907c91-cf16-471f-9f51-91cf0e5d0b9a",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "5287ff94-92af-4358-a356-c6a39a3708e2",
                                    "type": "RELATION",
                                    "name": "person",
                                    "label": "Person",
                                    "description": "Person",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "bf41eb34-0853-4cab-a537-3ac9c4e5dfdd",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "62c3eae9-09c6-4b98-9266-2d64772914cd",
                                            "nameSingular": "messageParticipant",
                                            "namePlural": "messageParticipants"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "5287ff94-92af-4358-a356-c6a39a3708e2",
                                            "name": "person"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8d5b1e3c-a76c-4171-90e4-fba40f894af9",
                                            "nameSingular": "person",
                                            "namePlural": "people"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "472200e6-8303-4fb4-a2e4-f39474b1750e",
                                            "name": "messageParticipants"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "33dcd1a7-bdbd-4dfb-8187-687f65c8ec38",
                                    "type": "SELECT",
                                    "name": "role",
                                    "label": "Role",
                                    "description": "Role",
                                    "icon": "IconAt",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'from'",
                                    "options": [
                                        {
                                            "id": "8da98ad2-cc9e-448d-98d1-05f327537e64",
                                            "color": "green",
                                            "label": "From",
                                            "value": "from",
                                            "position": 0
                                        },
                                        {
                                            "id": "9146fc28-1091-4427-83db-2808f4fcd194",
                                            "color": "blue",
                                            "label": "To",
                                            "value": "to",
                                            "position": 1
                                        },
                                        {
                                            "id": "924c74a1-bd21-4171-becc-865bd26f41d8",
                                            "color": "orange",
                                            "label": "Cc",
                                            "value": "cc",
                                            "position": 2
                                        },
                                        {
                                            "id": "20023301-e126-40a9-90b9-cdda118fc24b",
                                            "color": "red",
                                            "label": "Bcc",
                                            "value": "bcc",
                                            "position": 3
                                        }
                                    ],
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "c844cb27-2b95-447b-9db6-09876dcf316b",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "c0878b66-9aa7-4154-b238-00b58e46f981",
                                    "type": "UUID",
                                    "name": "personId",
                                    "label": "Person id (foreign key)",
                                    "description": "Person id foreign key",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b4a52505-c827-4173-b07a-d75a560237fa",
                                    "type": "UUID",
                                    "name": "workspaceMemberId",
                                    "label": "Workspace Member id (foreign key)",
                                    "description": "Workspace member id foreign key",
                                    "icon": "IconCircleUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
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
                    "id": "5bf3d57b-749f-4548-a27d-55ab942be344",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "d4f4fb78-8b51-442f-9e98-1b5a9de40b71",
                    "imageIdentifierFieldMetadataId": null,
                    "fields": {
                        "__typename": "ObjectFieldsConnection",
                        "pageInfo": {
                            "__typename": "PageInfo",
                            "hasNextPage": false,
                            "hasPreviousPage": false,
                            "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                            "endCursor": "YXJyYXljb25uZWN0aW9uOjIx"
                        },
                        "edges": [
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "14d409c5-72f9-43b0-8df7-f3320868171e",
                                    "type": "RELATION",
                                    "name": "workspaceMember",
                                    "label": "Workspace Member",
                                    "description": "Event workspace member",
                                    "icon": "IconCircleUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "13772cb9-ccbb-42eb-85a0-1b361b8dbd1e",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "5bf3d57b-749f-4548-a27d-55ab942be344",
                                            "nameSingular": "timelineActivity",
                                            "namePlural": "timelineActivities"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "14d409c5-72f9-43b0-8df7-f3320868171e",
                                            "name": "workspaceMember"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "c5698e4b-7c7e-4d39-a524-e5bf46b05dd5",
                                            "name": "timelineActivities"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "e41d2a5b-54b1-4462-a3fb-8976db60d22f",
                                    "type": "UUID",
                                    "name": "workspaceMemberId",
                                    "label": "Workspace Member id (foreign key)",
                                    "description": "Event workspace member id foreign key",
                                    "icon": "IconCircleUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b2a3a424-bd19-4d66-8a90-39285021cf30",
                                    "type": "UUID",
                                    "name": "opportunityId",
                                    "label": "Opportunity id (foreign key)",
                                    "description": "Event opportunity id foreign key",
                                    "icon": "IconTargetArrow",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "651ae81f-3a84-4b34-8fc1-c6d1721bf0a6",
                                    "type": "UUID",
                                    "name": "linkedObjectMetadataId",
                                    "label": "Linked Object Metadata Id",
                                    "description": "inked Object Metadata Id",
                                    "icon": "IconAbc",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "e2efb0fb-6ab5-4fa8-a043-10975586ea2d",
                                    "type": "RAW_JSON",
                                    "name": "properties",
                                    "label": "Event details",
                                    "description": "Json value for event details",
                                    "icon": "IconListDetails",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "845e1c49-7eda-42e9-b81a-92706d4fc87d",
                                    "type": "UUID",
                                    "name": "noteId",
                                    "label": "Note id (foreign key)",
                                    "description": "Event note id foreign key",
                                    "icon": "IconTargetArrow",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "ff4136ef-9cfe-4f52-978a-029bb79280ec",
                                    "type": "RELATION",
                                    "name": "task",
                                    "label": "Task",
                                    "description": "Event task",
                                    "icon": "IconTargetArrow",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "d958c7cb-3d66-42f6-9ccd-6a959666032b",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "5bf3d57b-749f-4548-a27d-55ab942be344",
                                            "nameSingular": "timelineActivity",
                                            "namePlural": "timelineActivities"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "ff4136ef-9cfe-4f52-978a-029bb79280ec",
                                            "name": "task"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "fa9c493a-8468-4141-807f-5a3999614474",
                                            "nameSingular": "task",
                                            "namePlural": "tasks"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "34c6fe29-1ad7-4e50-911b-ba703f885f8f",
                                            "name": "timelineActivities"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "aad02cd0-6db9-4768-9039-d9678debc438",
                                    "type": "RELATION",
                                    "name": "note",
                                    "label": "Note",
                                    "description": "Event note",
                                    "icon": "IconTargetArrow",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "55ddcb26-fed9-485a-affa-793f46991896",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "5bf3d57b-749f-4548-a27d-55ab942be344",
                                            "nameSingular": "timelineActivity",
                                            "namePlural": "timelineActivities"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "aad02cd0-6db9-4768-9039-d9678debc438",
                                            "name": "note"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "67951275-b5ae-4055-84af-e91c4febbc04",
                                            "nameSingular": "note",
                                            "namePlural": "notes"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "945d5cb5-acb0-4aa8-a748-0cff6af72fe8",
                                            "name": "timelineActivities"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "0979af79-7d48-4b9c-af99-e277c1b84827",
                                    "type": "UUID",
                                    "name": "taskId",
                                    "label": "Task id (foreign key)",
                                    "description": "Event task id foreign key",
                                    "icon": "IconTargetArrow",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "6154ec11-5a3b-46cf-95d9-ec6c84fa7a2a",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "342c85a9-bcd4-4abf-84cb-fd8218b6bfc8",
                                    "type": "UUID",
                                    "name": "personId",
                                    "label": "Person id (foreign key)",
                                    "description": "Event person id foreign key",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "83893f00-4e76-4b0f-b173-05fd02d9d906",
                                    "type": "RELATION",
                                    "name": "person",
                                    "label": "Person",
                                    "description": "Event person",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "c0452fc5-57c8-4ff7-81ce-cb35912ee073",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "5bf3d57b-749f-4548-a27d-55ab942be344",
                                            "nameSingular": "timelineActivity",
                                            "namePlural": "timelineActivities"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "83893f00-4e76-4b0f-b173-05fd02d9d906",
                                            "name": "person"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8d5b1e3c-a76c-4171-90e4-fba40f894af9",
                                            "nameSingular": "person",
                                            "namePlural": "people"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "a6dd2fc1-384d-40b2-880b-4499dead58d6",
                                            "name": "timelineActivities"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b09ca3ac-6a7e-404b-9e82-4acb4433e71c",
                                    "type": "TEXT",
                                    "name": "name",
                                    "label": "Event name",
                                    "description": "Event name",
                                    "icon": "IconAbc",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "a1b627bb-7898-4418-8576-aaa22df8a5c1",
                                    "type": "RELATION",
                                    "name": "company",
                                    "label": "Company",
                                    "description": "Event company",
                                    "icon": "IconBuildingSkyscraper",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "fd06c28d-63ac-4b73-868d-b998d86a2aa3",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "5bf3d57b-749f-4548-a27d-55ab942be344",
                                            "nameSingular": "timelineActivity",
                                            "namePlural": "timelineActivities"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "a1b627bb-7898-4418-8576-aaa22df8a5c1",
                                            "name": "company"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "29fc8ab6-b5fe-4a4c-bc23-2da8cbb5d6c4",
                                            "nameSingular": "company",
                                            "namePlural": "companies"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "5c186024-728d-42ab-8732-e8e1f12258c9",
                                            "name": "timelineActivities"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "65c81619-f527-427f-a384-fde5ab3cd20f",
                                    "type": "RELATION",
                                    "name": "opportunity",
                                    "label": "Opportunity",
                                    "description": "Event opportunity",
                                    "icon": "IconTargetArrow",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "264b1121-d996-4cbd-88e2-360b1a657b66",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "5bf3d57b-749f-4548-a27d-55ab942be344",
                                            "nameSingular": "timelineActivity",
                                            "namePlural": "timelineActivities"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "65c81619-f527-427f-a384-fde5ab3cd20f",
                                            "name": "opportunity"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "814be74c-fe3e-46b9-97db-4c4a61b9cfa7",
                                            "nameSingular": "opportunity",
                                            "namePlural": "opportunities"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "d9d492c7-fc7d-4760-a6b8-92d729573a7b",
                                            "name": "timelineActivities"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "0d5b596b-0c49-48c4-aa07-79bfd1a219c9",
                                    "type": "DATE_TIME",
                                    "name": "happensAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "3b12801e-ca07-4651-82c6-380ac4fc752a",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "e9e6c6c8-9565-474d-a873-54a700a8534f",
                                    "type": "UUID",
                                    "name": "linkedRecordId",
                                    "label": "Linked Record id",
                                    "description": "Linked Record id",
                                    "icon": "IconAbc",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "e0eea1b5-e83b-4f95-ae72-c60ddc9ba4e6",
                                    "type": "UUID",
                                    "name": "companyId",
                                    "label": "Company id (foreign key)",
                                    "description": "Event company id foreign key",
                                    "icon": "IconBuildingSkyscraper",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "eda2af0d-f0bd-4104-ab98-2fd97dc9ba9d",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "d4f4fb78-8b51-442f-9e98-1b5a9de40b71",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "a7d9aebb-3ac7-4188-8f1b-5bbbde5d7a69",
                                    "type": "TEXT",
                                    "name": "linkedRecordCachedName",
                                    "label": "Linked Record cached name",
                                    "description": "Cached record name",
                                    "icon": "IconAbc",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
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
                    "id": "57884046-eb9a-44d4-9c1b-ad3bd30ca5f3",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "36d76600-328a-474b-9e12-75327d3e96e5",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "36d76600-328a-474b-9e12-75327d3e96e5",
                                    "type": "TEXT",
                                    "name": "name",
                                    "label": "Event name",
                                    "description": "Event name/type",
                                    "icon": "IconAbc",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "0c7bbca2-7faa-4b91-8b23-8e23a3a74652",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "cd1c0bb6-4632-4c11-91f3-a760d4120006",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "16d7a266-00bc-4a24-9b97-a2931ebb366b",
                                    "type": "TEXT",
                                    "name": "objectName",
                                    "label": "Object name",
                                    "description": "Object name",
                                    "icon": "IconAbc",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "ab0f9d59-8916-435a-9578-4ae5ee30a1c9",
                                    "type": "RELATION",
                                    "name": "workspaceMember",
                                    "label": "Workspace Member",
                                    "description": "Event workspace member",
                                    "icon": "IconCircleUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "5785ded3-3c7d-4b80-be36-6c96af08135b",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "57884046-eb9a-44d4-9c1b-ad3bd30ca5f3",
                                            "nameSingular": "auditLog",
                                            "namePlural": "auditLogs"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "ab0f9d59-8916-435a-9578-4ae5ee30a1c9",
                                            "name": "workspaceMember"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "93f61381-a8fa-480a-9873-f4203e48ab0a",
                                            "name": "auditLogs"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "30d2843e-3214-42c1-aece-dd1e27073590",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f6b253a2-375b-4880-9bc2-d13f7b582716",
                                    "type": "RAW_JSON",
                                    "name": "context",
                                    "label": "Event context",
                                    "description": "Json object to provide context (user, device, workspace, etc.)",
                                    "icon": "IconListDetails",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f0871673-23aa-4960-8b9a-ed3ce22553ac",
                                    "type": "UUID",
                                    "name": "recordId",
                                    "label": "Record id",
                                    "description": "Record id",
                                    "icon": "IconAbc",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b6aa9848-b163-4e1c-9d2d-977588fe031f",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "e401aef1-fc99-4068-a677-63779da1db13",
                                    "type": "TEXT",
                                    "name": "objectMetadataId",
                                    "label": "Object metadata id",
                                    "description": "Object metadata id",
                                    "icon": "IconAbc",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b0a67dc4-864a-4d92-90ea-4546fd636349",
                                    "type": "UUID",
                                    "name": "workspaceMemberId",
                                    "label": "Workspace Member id (foreign key)",
                                    "description": "Event workspace member id foreign key",
                                    "icon": "IconCircleUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "1eb3538e-bb94-4488-8ea6-7436567cea27",
                                    "type": "RAW_JSON",
                                    "name": "properties",
                                    "label": "Event details",
                                    "description": "Json value for event details",
                                    "icon": "IconListDetails",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
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
                    "id": "53f58c52-b8d0-4eca-b5de-12be555c9d21",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "1eae9810-dc80-40ce-acd8-8e05f1f20257",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "b97c2d82-4a33-49ab-a052-5848d3615f46",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "1bf47c9f-c8b6-4500-b2f3-17b9bc6f9aa8",
                                    "type": "TEXT",
                                    "name": "type",
                                    "label": "Type",
                                    "description": "Activity type",
                                    "icon": "IconCheckbox",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'Note'",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "2bff7da5-a294-45ee-b3e7-c0f1671077d0",
                                    "type": "RELATION",
                                    "name": "assignee",
                                    "label": "Assignee",
                                    "description": "Activity assignee",
                                    "icon": "IconUserCircle",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "0c0ada9f-6748-4a1f-9dc0-3f3d79c032ef",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "53f58c52-b8d0-4eca-b5de-12be555c9d21",
                                            "nameSingular": "activity",
                                            "namePlural": "activities"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "2bff7da5-a294-45ee-b3e7-c0f1671077d0",
                                            "name": "assignee"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "3dc0a67f-5695-4f7c-9b78-3ac6a0fa2758",
                                            "name": "assignedActivities"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "03660b2b-3e01-467a-816a-aef5ff3346b2",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "12c73546-009f-47c1-8492-af8b4a9bb2e4",
                                    "type": "RELATION",
                                    "name": "attachments",
                                    "label": "Attachments",
                                    "description": "Activity attachments",
                                    "icon": "IconFileImport",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "4335e402-4e69-4bc9-9cde-6abd737f27c3",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "53f58c52-b8d0-4eca-b5de-12be555c9d21",
                                            "nameSingular": "activity",
                                            "namePlural": "activities"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "12c73546-009f-47c1-8492-af8b4a9bb2e4",
                                            "name": "attachments"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b6c30b65-7822-4622-800c-5478baf15844",
                                            "nameSingular": "attachment",
                                            "namePlural": "attachments"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "0c623577-6717-4d70-8d87-da83253483a6",
                                            "name": "activity"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "acf1d548-2dd6-4922-ad95-f1dd25c239ba",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "d5aa5b80-559d-4ae6-9028-56c6c5e14fd2",
                                    "type": "RELATION",
                                    "name": "comments",
                                    "label": "Comments",
                                    "description": "Activity comments",
                                    "icon": "IconComment",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "826d0f01-70bc-40ee-90a5-795357bb5246",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "53f58c52-b8d0-4eca-b5de-12be555c9d21",
                                            "nameSingular": "activity",
                                            "namePlural": "activities"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "d5aa5b80-559d-4ae6-9028-56c6c5e14fd2",
                                            "name": "comments"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "df7a3973-337b-4619-a0f3-db487abef303",
                                            "nameSingular": "comment",
                                            "namePlural": "comments"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "25983f78-ccf6-4646-8925-8dfde3e038ed",
                                            "name": "activity"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f90b0f19-f3be-47af-b1f8-5baa30b1ce64",
                                    "type": "UUID",
                                    "name": "assigneeId",
                                    "label": "Assignee id (foreign key)",
                                    "description": "Activity assignee id foreign key",
                                    "icon": "IconUserCircle",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f6465d15-fb96-4609-8df9-d2aa1bfa97cb",
                                    "type": "DATE_TIME",
                                    "name": "completedAt",
                                    "label": "Completion Date",
                                    "description": "Activity completion date",
                                    "icon": "IconCheck",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b59276af-8aa5-4969-8bda-c679d29f998a",
                                    "type": "UUID",
                                    "name": "authorId",
                                    "label": "Author id (foreign key)",
                                    "description": "Activity author id foreign key",
                                    "icon": "IconUserCircle",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "1eae9810-dc80-40ce-acd8-8e05f1f20257",
                                    "type": "TEXT",
                                    "name": "title",
                                    "label": "Title",
                                    "description": "Activity title",
                                    "icon": "IconNotes",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "c4fe2e68-6fd4-4816-a3bc-a203be004dc4",
                                    "type": "TEXT",
                                    "name": "body",
                                    "label": "Body",
                                    "description": "Activity body",
                                    "icon": "IconList",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "c39a2537-4ce7-43bb-ab88-49ea78149dfa",
                                    "type": "DATE_TIME",
                                    "name": "dueAt",
                                    "label": "Due Date",
                                    "description": "Activity due date",
                                    "icon": "IconCalendarEvent",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b1c47d52-39d3-4f2f-90bb-48c7220d3b38",
                                    "type": "RELATION",
                                    "name": "author",
                                    "label": "Author",
                                    "description": "Activity author",
                                    "icon": "IconUserCircle",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "3143e1f1-0bd1-4114-bf51-efd71378e7d8",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "53f58c52-b8d0-4eca-b5de-12be555c9d21",
                                            "nameSingular": "activity",
                                            "namePlural": "activities"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "b1c47d52-39d3-4f2f-90bb-48c7220d3b38",
                                            "name": "author"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "eb2aee07-cf60-4145-9acc-384c1c41a77c",
                                            "name": "authoredActivities"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "be67eea2-9bfb-41dc-b76e-376bf9f96ce8",
                                    "type": "DATE_TIME",
                                    "name": "reminderAt",
                                    "label": "Reminder Date",
                                    "description": "Activity reminder date",
                                    "icon": "IconCalendarEvent",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "d2def40e-2eb2-45c3-b2fe-755cd1986722",
                                    "type": "RELATION",
                                    "name": "activityTargets",
                                    "label": "Targets",
                                    "description": "Activity targets",
                                    "icon": "IconCheckbox",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "9270b2dd-a55c-439c-b1d7-f2d6171ee641",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "53f58c52-b8d0-4eca-b5de-12be555c9d21",
                                            "nameSingular": "activity",
                                            "namePlural": "activities"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "d2def40e-2eb2-45c3-b2fe-755cd1986722",
                                            "name": "activityTargets"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "917b273d-1c97-4d02-b69b-215516cb9f70",
                                            "nameSingular": "activityTarget",
                                            "namePlural": "activityTargets"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "4e77a199-8f89-48d5-bda6-4c2bfa712fd3",
                                            "name": "activity"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "d3bb57b2-e822-400e-81e9-e7eb50c54ee2",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
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
                    "id": "41e3a1c9-6ae9-49bc-a730-c945ae162bb9",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "aa873787-c9aa-43e5-a2d9-5111c10614e7",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "989373b4-99db-4843-959a-88e23340939a",
                                    "type": "RELATION",
                                    "name": "connectedAccount",
                                    "label": "Connected Account",
                                    "description": "Connected Account",
                                    "icon": "IconUserCircle",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "7cd28af4-cab3-44cb-965f-fd068021f580",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "41e3a1c9-6ae9-49bc-a730-c945ae162bb9",
                                            "nameSingular": "calendarChannel",
                                            "namePlural": "calendarChannels"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "989373b4-99db-4843-959a-88e23340939a",
                                            "name": "connectedAccount"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "f253841b-31ef-407b-baa7-a84e9d2fc0ef",
                                            "nameSingular": "connectedAccount",
                                            "namePlural": "connectedAccounts"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "ea7f19cc-bf0b-4629-a2ce-9cba81a97750",
                                            "name": "calendarChannels"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f4721d17-2f79-4368-b61c-3eaac7e79ab7",
                                    "type": "BOOLEAN",
                                    "name": "isContactAutoCreationEnabled",
                                    "label": "Is Contact Auto Creation Enabled",
                                    "description": "Is Contact Auto Creation Enabled",
                                    "icon": "IconUserCircle",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": true,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "fe9bf24e-a569-4a8f-9417-ca24d624c7b5",
                                    "type": "RELATION",
                                    "name": "calendarChannelEventAssociations",
                                    "label": "Calendar Channel Event Associations",
                                    "description": "Calendar Channel Event Associations",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "9a6f8a86-74bb-428d-80e6-54605fa95060",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "41e3a1c9-6ae9-49bc-a730-c945ae162bb9",
                                            "nameSingular": "calendarChannel",
                                            "namePlural": "calendarChannels"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "fe9bf24e-a569-4a8f-9417-ca24d624c7b5",
                                            "name": "calendarChannelEventAssociations"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "7d340e2b-eddb-4b31-96b5-c9812d2f5742",
                                            "nameSingular": "calendarChannelEventAssociation",
                                            "namePlural": "calendarChannelEventAssociations"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "be6ec181-e215-4a45-ba60-f61878c67d44",
                                            "name": "calendarChannel"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f42bd2a5-20d3-4cb8-8e61-ad65666a9358",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "e69cd649-8e01-4ecc-810e-28c5599193f3",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "8ec39b56-0811-48b8-88dd-d0e5fa29e83e",
                                    "type": "SELECT",
                                    "name": "syncStage",
                                    "label": "Sync stage",
                                    "description": "Sync stage",
                                    "icon": "IconStatusChange",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'FULL_CALENDAR_EVENT_LIST_FETCH_PENDING'",
                                    "options": [
                                        {
                                            "id": "5b96f406-9520-495d-af4b-ef1f93eca9d8",
                                            "color": "blue",
                                            "label": "Full calendar event list fetch pending",
                                            "value": "FULL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                                            "position": 0
                                        },
                                        {
                                            "id": "678f6d22-a4a1-4b3e-88c0-1fb876d548ba",
                                            "color": "blue",
                                            "label": "Partial calendar event list fetch pending",
                                            "value": "PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                                            "position": 1
                                        },
                                        {
                                            "id": "e4132a6a-9206-4799-82cb-429ccb03c491",
                                            "color": "orange",
                                            "label": "Calendar event list fetch ongoing",
                                            "value": "CALENDAR_EVENT_LIST_FETCH_ONGOING",
                                            "position": 2
                                        },
                                        {
                                            "id": "1569d212-d910-4674-a81b-5cc7e3c7b500",
                                            "color": "blue",
                                            "label": "Calendar events import pending",
                                            "value": "CALENDAR_EVENTS_IMPORT_PENDING",
                                            "position": 3
                                        },
                                        {
                                            "id": "c72a512d-030a-462e-bd94-7042ccbacfd4",
                                            "color": "orange",
                                            "label": "Calendar events import ongoing",
                                            "value": "CALENDAR_EVENTS_IMPORT_ONGOING",
                                            "position": 4
                                        },
                                        {
                                            "id": "20ce7e98-4866-429a-969b-b8b88fed4832",
                                            "color": "red",
                                            "label": "Failed",
                                            "value": "FAILED",
                                            "position": 5
                                        }
                                    ],
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b183cad7-ea05-4cc0-b1d7-0add6c37fce3",
                                    "type": "SELECT",
                                    "name": "visibility",
                                    "label": "Visibility",
                                    "description": "Visibility",
                                    "icon": "IconEyeglass",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'SHARE_EVERYTHING'",
                                    "options": [
                                        {
                                            "id": "ad04d906-efff-4fbc-bc47-808b47810b62",
                                            "color": "green",
                                            "label": "Metadata",
                                            "value": "METADATA",
                                            "position": 0
                                        },
                                        {
                                            "id": "8a7f3b97-be9a-4248-872e-3ffda0322b6f",
                                            "color": "orange",
                                            "label": "Share Everything",
                                            "value": "SHARE_EVERYTHING",
                                            "position": 1
                                        }
                                    ],
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f249883a-c5c5-47da-a218-b96f2d593272",
                                    "type": "DATE_TIME",
                                    "name": "syncStageStartedAt",
                                    "label": "Sync stage started at",
                                    "description": "Sync stage started at",
                                    "icon": "IconHistory",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "fa36832f-fb53-48ed-ad9b-aadf88619991",
                                    "type": "TEXT",
                                    "name": "syncCursor",
                                    "label": "Sync Cursor",
                                    "description": "Sync Cursor. Used for syncing events from the calendar provider",
                                    "icon": "IconReload",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "e338a537-05a4-4b8c-8214-f4a44b9d2682",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "795c89f4-1522-485b-af07-525c6a41f114",
                                    "type": "SELECT",
                                    "name": "contactAutoCreationPolicy",
                                    "label": "Contact auto creation policy",
                                    "description": "Automatically create records for people you participated with in an event.",
                                    "icon": "IconUserCircle",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'AS_PARTICIPANT_AND_ORGANIZER'",
                                    "options": [
                                        {
                                            "id": "33f786bf-582b-4a7c-9bac-6ef1fca201a0",
                                            "color": "green",
                                            "label": "As Participant and Organizer",
                                            "value": "AS_PARTICIPANT_AND_ORGANIZER",
                                            "position": 0
                                        },
                                        {
                                            "id": "fd9d476a-0403-4b27-a54f-3908dda95f6e",
                                            "color": "orange",
                                            "label": "As Participant",
                                            "value": "AS_PARTICIPANT",
                                            "position": 1
                                        },
                                        {
                                            "id": "7249d930-f7b9-44ba-8613-02abf5457479",
                                            "color": "blue",
                                            "label": "As Organizer",
                                            "value": "AS_ORGANIZER",
                                            "position": 2
                                        },
                                        {
                                            "id": "4e91eb86-30b1-456f-b65b-64b822b537ad",
                                            "color": "red",
                                            "label": "None",
                                            "value": "NONE",
                                            "position": 3
                                        }
                                    ],
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "283b0511-d147-43ba-ad6e-95ff33d8eee6",
                                    "type": "BOOLEAN",
                                    "name": "isSyncEnabled",
                                    "label": "Is Sync Enabled",
                                    "description": "Is Sync Enabled",
                                    "icon": "IconRefresh",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": true,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "818b797b-a5ff-4497-bb33-2f530eafd5f6",
                                    "type": "UUID",
                                    "name": "connectedAccountId",
                                    "label": "Connected Account id (foreign key)",
                                    "description": "Connected Account id foreign key",
                                    "icon": "IconUserCircle",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "aa873787-c9aa-43e5-a2d9-5111c10614e7",
                                    "type": "TEXT",
                                    "name": "handle",
                                    "label": "Handle",
                                    "description": "Handle",
                                    "icon": "IconAt",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "a6055885-778c-4659-8f08-17e6c76dbf0a",
                                    "type": "SELECT",
                                    "name": "syncStatus",
                                    "label": "Sync status",
                                    "description": "Sync status",
                                    "icon": "IconStatusChange",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": [
                                        {
                                            "id": "da9549ce-af8b-4698-8a58-8cb6730aa0fc",
                                            "color": "yellow",
                                            "label": "Ongoing",
                                            "value": "ONGOING",
                                            "position": 1
                                        },
                                        {
                                            "id": "ecf51125-4a84-4bee-bb2f-737862d495b0",
                                            "color": "blue",
                                            "label": "Not Synced",
                                            "value": "NOT_SYNCED",
                                            "position": 2
                                        },
                                        {
                                            "id": "003f3b47-7c32-4cef-818b-0ae3856e4e60",
                                            "color": "green",
                                            "label": "Active",
                                            "value": "ACTIVE",
                                            "position": 3
                                        },
                                        {
                                            "id": "24ce2432-b42e-4254-89a9-5552ee1b346b",
                                            "color": "red",
                                            "label": "Failed Insufficient Permissions",
                                            "value": "FAILED_INSUFFICIENT_PERMISSIONS",
                                            "position": 4
                                        },
                                        {
                                            "id": "5a49dfb0-b2d4-496c-9050-9db81beab717",
                                            "color": "red",
                                            "label": "Failed Unknown",
                                            "value": "FAILED_UNKNOWN",
                                            "position": 5
                                        }
                                    ],
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "5cfd3a47-a627-4096-8cb5-70bf41b40422",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "3a94642d-ebb2-480e-b014-077c574a4843",
                                    "type": "NUMBER",
                                    "name": "throttleFailureCount",
                                    "label": "Throttle Failure Count",
                                    "description": "Throttle Failure Count",
                                    "icon": "IconX",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": 0,
                                    "options": null,
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
                    "id": "3cab3e59-fe91-4a3a-89f0-73cc1931af3e",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
                    "nameSingular": "workflowVersion",
                    "namePlural": "workflowVersions",
                    "labelSingular": "WorkflowVersion",
                    "labelPlural": "WorkflowVersions",
                    "description": "A workflow version",
                    "icon": "IconVersions",
                    "isCustom": false,
                    "isRemote": false,
                    "isActive": true,
                    "isSystem": true,
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "934349b4-1470-4f48-aed5-194b854c0a12",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "6644825a-87fb-4e41-932e-48dca26c6644",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "441c7be0-c7ab-47ad-8c8a-7ac2b1b8de40",
                                    "type": "RELATION",
                                    "name": "workflow",
                                    "label": "Workflow",
                                    "description": "WorkflowVersion workflow",
                                    "icon": "IconSettingsAutomation",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "3b1485b3-92e5-439e-b2ab-0a48fa4f8fb1",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "3cab3e59-fe91-4a3a-89f0-73cc1931af3e",
                                            "nameSingular": "workflowVersion",
                                            "namePlural": "workflowVersions"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "441c7be0-c7ab-47ad-8c8a-7ac2b1b8de40",
                                            "name": "workflow"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "70e01911-b789-43b9-b80f-b78b5b64aaba",
                                            "nameSingular": "workflow",
                                            "namePlural": "workflows"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "7b7d5efa-1ec1-45bf-982c-377ed0d005a7",
                                            "name": "versions"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "9c571fe4-faaf-4b93-a8dc-4f20043cc15a",
                                    "type": "SELECT",
                                    "name": "status",
                                    "label": "Version status",
                                    "description": "The workflow version status",
                                    "icon": null,
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'DRAFT'",
                                    "options": [
                                        {
                                            "id": "3a7b7874-de3c-4ca4-b6ee-1bd37d3d545c",
                                            "color": "yellow",
                                            "label": "Draft",
                                            "value": "DRAFT",
                                            "position": 0
                                        },
                                        {
                                            "id": "6155b986-eace-4ba2-bc06-7a113ae6b4f6",
                                            "color": "green",
                                            "label": "Active",
                                            "value": "ACTIVE",
                                            "position": 1
                                        },
                                        {
                                            "id": "5507a3aa-32b1-430a-88ba-9565872adddc",
                                            "color": "red",
                                            "label": "Deactivated",
                                            "value": "DEACTIVATED",
                                            "position": 2
                                        },
                                        {
                                            "id": "c5e09780-8beb-48ec-bbf3-b34586e393e5",
                                            "color": "grey",
                                            "label": "Archived",
                                            "value": "ARCHIVED",
                                            "position": 3
                                        }
                                    ],
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "050c52a7-d049-4847-b091-709f2fae8e0d",
                                    "type": "RELATION",
                                    "name": "runs",
                                    "label": "Runs",
                                    "description": "Workflow runs linked to the version.",
                                    "icon": "IconVersions",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "564e0af2-972d-47e4-be7f-8c2a329bad9f",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "3cab3e59-fe91-4a3a-89f0-73cc1931af3e",
                                            "nameSingular": "workflowVersion",
                                            "namePlural": "workflowVersions"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "050c52a7-d049-4847-b091-709f2fae8e0d",
                                            "name": "runs"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "d6c63917-ecc3-4245-8394-61fe04db32f4",
                                            "nameSingular": "workflowRun",
                                            "namePlural": "workflowRuns"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "6782699c-f4d9-4d2c-9acc-a1bdf54c080d",
                                            "name": "workflowVersion"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "2f72dc5c-998a-46e7-bf02-f43c76a2f411",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "5b6b2741-59c0-40f6-b7cb-81026a22651a",
                                    "type": "RAW_JSON",
                                    "name": "steps",
                                    "label": "Version steps",
                                    "description": "Json object to provide steps",
                                    "icon": null,
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "ffa82a56-4585-4c34-8c17-ce3e9194627e",
                                    "type": "UUID",
                                    "name": "workflowId",
                                    "label": "Workflow id (foreign key)",
                                    "description": "WorkflowVersion workflow id foreign key",
                                    "icon": "IconSettingsAutomation",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "46eae583-e9e1-4d63-9efd-117101c6a1ac",
                                    "type": "RAW_JSON",
                                    "name": "trigger",
                                    "label": "Version trigger",
                                    "description": "Json object to provide trigger",
                                    "icon": null,
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "934349b4-1470-4f48-aed5-194b854c0a12",
                                    "type": "TEXT",
                                    "name": "name",
                                    "label": "Name",
                                    "description": "The workflow version name",
                                    "icon": "IconVersions",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "2a798286-b0b3-46c2-a6db-ffd9c6417628",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "44d49bdd-018b-4972-a01b-baf2f5f17d51",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
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
                    "id": "30789ecd-83bc-4bc8-927c-5b34e0418557",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "e6d1f581-d169-4b5e-b0a6-b08f6bf3a88c",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "b1bd963b-357b-44a8-b098-770731ef83a6",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "2bf7ed16-8223-4a3e-8f82-31e0bb55ff39",
                                    "type": "UUID",
                                    "name": "viewId",
                                    "label": "View id (foreign key)",
                                    "description": "View Sort related view id foreign key",
                                    "icon": "IconLayoutCollage",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "e3df0a4a-69b2-42c2-af99-2ce78520f033",
                                    "type": "UUID",
                                    "name": "fieldMetadataId",
                                    "label": "Field Metadata Id",
                                    "description": "View Sort target field",
                                    "icon": "IconTag",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "68b4bcaf-a7be-4fb9-9c15-09c67c77e373",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "7590ab9a-3c09-4606-8e40-6ee5df27fa45",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "a56c5d76-920b-4e5e-b616-83b8af24bc7a",
                                    "type": "RELATION",
                                    "name": "view",
                                    "label": "View",
                                    "description": "View Sort related view",
                                    "icon": "IconLayoutCollage",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "6f6e3bb7-b59e-4b7d-a527-e34763c9f8b2",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "30789ecd-83bc-4bc8-927c-5b34e0418557",
                                            "nameSingular": "viewSort",
                                            "namePlural": "viewSorts"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "a56c5d76-920b-4e5e-b616-83b8af24bc7a",
                                            "name": "view"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "e6155188-ccb3-4af9-9a60-9fb387cf19d6",
                                            "nameSingular": "view",
                                            "namePlural": "views"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "6aa2b0ae-8cbd-4377-b3ca-939847263197",
                                            "name": "viewSorts"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "e6d1f581-d169-4b5e-b0a6-b08f6bf3a88c",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "5d4fc95a-e7f4-4c41-bdb3-7c01e4f22a6d",
                                    "type": "TEXT",
                                    "name": "direction",
                                    "label": "Direction",
                                    "description": "View Sort direction",
                                    "icon": null,
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'asc'",
                                    "options": null,
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
                    "id": "29fc8ab6-b5fe-4a4c-bc23-2da8cbb5d6c4",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "9ab91930-ec97-46ec-9d58-aa21a26e5a20",
                    "imageIdentifierFieldMetadataId": null,
                    "fields": {
                        "__typename": "ObjectFieldsConnection",
                        "pageInfo": {
                            "__typename": "PageInfo",
                            "hasNextPage": false,
                            "hasPreviousPage": false,
                            "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                            "endCursor": "YXJyYXljb25uZWN0aW9uOjI3"
                        },
                        "edges": [
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "8e0ca58e-bcfe-47b3-b0cc-651c432dea19",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "5c80507f-4f18-4270-a95c-d511a3672fb8",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "37d7e430-20d9-4a47-89b4-df4b2e058f86",
                                    "type": "RELATION",
                                    "name": "taskTargets",
                                    "label": "Tasks",
                                    "description": "Tasks tied to the company",
                                    "icon": "IconCheckbox",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "a080e416-7644-4983-a819-acc69a96c211",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "29fc8ab6-b5fe-4a4c-bc23-2da8cbb5d6c4",
                                            "nameSingular": "company",
                                            "namePlural": "companies"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "37d7e430-20d9-4a47-89b4-df4b2e058f86",
                                            "name": "taskTargets"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "810794a8-ae9f-4b7a-9b6c-4fdba1fa45bd",
                                            "nameSingular": "taskTarget",
                                            "namePlural": "taskTargets"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "3861e09b-e1b9-4258-bf9f-783551bbee73",
                                            "name": "company"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "99253b72-d878-4f74-9713-a91535d85beb",
                                    "type": "LINKS",
                                    "name": "domainName",
                                    "label": "Domain Name",
                                    "description": "The company website URL. We use this url to fetch the company icon",
                                    "icon": "IconLink",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": {
                                        "primaryLinkUrl": "''",
                                        "secondaryLinks": null,
                                        "primaryLinkLabel": "''"
                                    },
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "59dc4e44-f1c2-41ff-85de-2fa48213a1aa",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "4f82b950-66eb-4008-a127-1b6b884bd28d",
                                    "type": "LINKS",
                                    "name": "introVideo",
                                    "label": "Intro Video",
                                    "description": "Company's Intro Video",
                                    "icon": "IconVideo",
                                    "isCustom": true,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:52:09.454Z",
                                    "updatedAt": "2024-09-20T08:52:09.454Z",
                                    "defaultValue": {
                                        "primaryLinkUrl": "''",
                                        "secondaryLinks": null,
                                        "primaryLinkLabel": "''"
                                    },
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "afb13fb1-b59a-4d53-afe3-8ea7b32a0ccf",
                                    "type": "LINKS",
                                    "name": "linkedinLink",
                                    "label": "Linkedin",
                                    "description": "The company Linkedin account",
                                    "icon": "IconBrandLinkedin",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": {
                                        "primaryLinkUrl": "''",
                                        "secondaryLinks": null,
                                        "primaryLinkLabel": "''"
                                    },
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f92133e6-e357-4798-8fb1-45b5ed3520b4",
                                    "type": "RELATION",
                                    "name": "people",
                                    "label": "People",
                                    "description": "People linked to the company.",
                                    "icon": "IconUsers",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "61d4d0e3-9b86-4999-b847-0f1edbeb18ac",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "29fc8ab6-b5fe-4a4c-bc23-2da8cbb5d6c4",
                                            "nameSingular": "company",
                                            "namePlural": "companies"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "f92133e6-e357-4798-8fb1-45b5ed3520b4",
                                            "name": "people"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8d5b1e3c-a76c-4171-90e4-fba40f894af9",
                                            "nameSingular": "person",
                                            "namePlural": "people"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "30324d54-b46f-46b4-965b-d27f6ac10e35",
                                            "name": "company"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "212cd31a-a6df-4faf-b41c-50286ec019c1",
                                    "type": "POSITION",
                                    "name": "position",
                                    "label": "Position",
                                    "description": "Company record position",
                                    "icon": "IconHierarchy2",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "84c79ab3-89ab-4247-8cac-5ab0be1c8ba3",
                                    "type": "RELATION",
                                    "name": "favorites",
                                    "label": "Favorites",
                                    "description": "Favorites linked to the company",
                                    "icon": "IconHeart",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "6666b6e5-1c22-4a77-a949-d122cd740012",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "29fc8ab6-b5fe-4a4c-bc23-2da8cbb5d6c4",
                                            "nameSingular": "company",
                                            "namePlural": "companies"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "84c79ab3-89ab-4247-8cac-5ab0be1c8ba3",
                                            "name": "favorites"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b2417845-c5d5-4d5e-8f6a-5a2eafca2983",
                                            "nameSingular": "favorite",
                                            "namePlural": "favorites"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "1913b5e4-5aa5-44c7-946e-9da93eaf82ff",
                                            "name": "company"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "ee7430c5-67fd-49c2-aa87-e60b61c310bb",
                                    "type": "NUMBER",
                                    "name": "employees",
                                    "label": "Employees",
                                    "description": "Number of employees in the company",
                                    "icon": "IconUsers",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "758cc259-eaf1-4798-8d58-8031c9e1be87",
                                    "type": "ACTOR",
                                    "name": "createdBy",
                                    "label": "Created by",
                                    "description": "The creator of the record",
                                    "icon": "IconCreativeCommonsSa",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": {
                                        "name": "''",
                                        "source": "'MANUAL'"
                                    },
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "64b0533c-51d7-4568-9906-218565c7d2a7",
                                    "type": "BOOLEAN",
                                    "name": "visaSponsorship",
                                    "label": "Visa Sponsorship",
                                    "description": "Company's Visa Sponsorship Policy",
                                    "icon": "IconBrandVisa",
                                    "isCustom": true,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:52:09.884Z",
                                    "updatedAt": "2024-09-20T08:52:09.884Z",
                                    "defaultValue": false,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f786dc8c-a416-4c45-b67e-93820b1444f3",
                                    "type": "TEXT",
                                    "name": "tagline",
                                    "label": "Tagline",
                                    "description": "Company's Tagline",
                                    "icon": "IconAdCircle",
                                    "isCustom": true,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:52:09.228Z",
                                    "updatedAt": "2024-09-20T08:52:09.228Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "73de9fe2-82df-4a55-a51c-6cfc6d99827b",
                                    "type": "CURRENCY",
                                    "name": "annualRecurringRevenue",
                                    "label": "ARR",
                                    "description": "Annual Recurring Revenue: The actual or estimated annual revenue of the company",
                                    "icon": "IconMoneybag",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": {
                                        "amountMicros": null,
                                        "currencyCode": "''"
                                    },
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "87a5aad9-f48f-451c-aef2-4872fdb36cd0",
                                    "type": "RELATION",
                                    "name": "opportunities",
                                    "label": "Opportunities",
                                    "description": "Opportunities linked to the company.",
                                    "icon": "IconTargetArrow",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "c62a0630-b4aa-41de-8d5f-4b0b61258d17",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "29fc8ab6-b5fe-4a4c-bc23-2da8cbb5d6c4",
                                            "nameSingular": "company",
                                            "namePlural": "companies"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "87a5aad9-f48f-451c-aef2-4872fdb36cd0",
                                            "name": "opportunities"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "814be74c-fe3e-46b9-97db-4c4a61b9cfa7",
                                            "nameSingular": "opportunity",
                                            "namePlural": "opportunities"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "a95851c7-7a97-4490-9246-3bb08a17a36d",
                                            "name": "company"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "5c186024-728d-42ab-8732-e8e1f12258c9",
                                    "type": "RELATION",
                                    "name": "timelineActivities",
                                    "label": "Timeline Activities",
                                    "description": "Timeline Activities linked to the company",
                                    "icon": "IconIconTimelineEvent",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "fd06c28d-63ac-4b73-868d-b998d86a2aa3",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "29fc8ab6-b5fe-4a4c-bc23-2da8cbb5d6c4",
                                            "nameSingular": "company",
                                            "namePlural": "companies"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "5c186024-728d-42ab-8732-e8e1f12258c9",
                                            "name": "timelineActivities"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "5bf3d57b-749f-4548-a27d-55ab942be344",
                                            "nameSingular": "timelineActivity",
                                            "namePlural": "timelineActivities"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "a1b627bb-7898-4418-8576-aaa22df8a5c1",
                                            "name": "company"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "06f20ae5-723b-4cd6-9849-a45a1f1cd54b",
                                    "type": "RELATION",
                                    "name": "noteTargets",
                                    "label": "Notes",
                                    "description": "Notes tied to the company",
                                    "icon": "IconNotes",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "6e69901d-d6be-41cb-9e76-f433cb37e65c",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "29fc8ab6-b5fe-4a4c-bc23-2da8cbb5d6c4",
                                            "nameSingular": "company",
                                            "namePlural": "companies"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "06f20ae5-723b-4cd6-9849-a45a1f1cd54b",
                                            "name": "noteTargets"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "bf8361ec-642c-4965-8948-84fa0c9aca76",
                                            "nameSingular": "noteTarget",
                                            "namePlural": "noteTargets"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "9d693b1a-80eb-43ea-9148-b75d6ebe06d1",
                                            "name": "company"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "a497e10c-d2c1-4d60-88a4-108dc659f7b3",
                                    "type": "RELATION",
                                    "name": "activityTargets",
                                    "label": "Activities",
                                    "description": "Activities tied to the company",
                                    "icon": "IconCheckbox",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "80e54814-98d1-4050-b55e-a8677bda108c",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "29fc8ab6-b5fe-4a4c-bc23-2da8cbb5d6c4",
                                            "nameSingular": "company",
                                            "namePlural": "companies"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "a497e10c-d2c1-4d60-88a4-108dc659f7b3",
                                            "name": "activityTargets"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "917b273d-1c97-4d02-b69b-215516cb9f70",
                                            "nameSingular": "activityTarget",
                                            "namePlural": "activityTargets"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "0e9928fc-cdfd-400d-8cde-f7d602d295e7",
                                            "name": "company"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "d57304f3-3e08-4fc6-b812-88006e0f91be",
                                    "type": "BOOLEAN",
                                    "name": "idealCustomerProfile",
                                    "label": "ICP",
                                    "description": "Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you",
                                    "icon": "IconTarget",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": false,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "d4e48853-ace1-4be6-b0bf-254d06554d2c",
                                    "type": "ADDRESS",
                                    "name": "address",
                                    "label": "Address",
                                    "description": "Address of the company",
                                    "icon": "IconMap",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
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
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "bb04d33c-7c15-49a9-95f8-2941b328a3fd",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "01faa409-63c0-40e6-91a7-f9ca2052ada3",
                                    "type": "RELATION",
                                    "name": "accountOwner",
                                    "label": "Account Owner",
                                    "description": "Your team member responsible for managing the company account",
                                    "icon": "IconUserCircle",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "8d372fda-92c4-4400-a13f-ac2f6c57f7f0",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "29fc8ab6-b5fe-4a4c-bc23-2da8cbb5d6c4",
                                            "nameSingular": "company",
                                            "namePlural": "companies"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "01faa409-63c0-40e6-91a7-f9ca2052ada3",
                                            "name": "accountOwner"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "175afe7b-6d80-40c5-a7b4-612c76d11c11",
                                            "name": "accountOwnerForCompanies"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "cf3f60f9-85c9-4e3b-81c0-b7408d709a11",
                                    "type": "UUID",
                                    "name": "accountOwnerId",
                                    "label": "Account Owner id (foreign key)",
                                    "description": "Your team member responsible for managing the company account id foreign key",
                                    "icon": "IconUserCircle",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "9ab91930-ec97-46ec-9d58-aa21a26e5a20",
                                    "type": "TEXT",
                                    "name": "name",
                                    "label": "Name",
                                    "description": "The company name",
                                    "icon": "IconBuildingSkyscraper",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "5a867bb9-4d2f-4fb7-a91f-169a2992ae1a",
                                    "type": "LINKS",
                                    "name": "xLink",
                                    "label": "X",
                                    "description": "The company Twitter/X account",
                                    "icon": "IconBrandX",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": {
                                        "primaryLinkUrl": "''",
                                        "secondaryLinks": null,
                                        "primaryLinkLabel": "''"
                                    },
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "d029255e-0716-469e-9b70-43e8115a80cc",
                                    "type": "MULTI_SELECT",
                                    "name": "workPolicy",
                                    "label": "Work Policy",
                                    "description": "Company's Work Policy",
                                    "icon": "IconHome",
                                    "isCustom": true,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:52:09.663Z",
                                    "updatedAt": "2024-09-20T08:52:09.663Z",
                                    "defaultValue": null,
                                    "options": [
                                        {
                                            "id": "40853c6d-5e61-487c-adf8-65c18d3d0d3a",
                                            "color": "green",
                                            "label": "On-Site",
                                            "value": "ON_SITE",
                                            "position": 0
                                        },
                                        {
                                            "id": "9cf5a82d-0079-46f5-8ee1-a0b48725c46b",
                                            "color": "turquoise",
                                            "label": "Hybrid",
                                            "value": "HYBRID",
                                            "position": 1
                                        },
                                        {
                                            "id": "8bf434ad-c9ea-4ce7-8da8-3d5971a5e785",
                                            "color": "sky",
                                            "label": "Remote Work",
                                            "value": "REMOTE_WORK",
                                            "position": 2
                                        }
                                    ],
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b83f5915-d57b-4827-8c3e-141c508c2d8f",
                                    "type": "RELATION",
                                    "name": "attachments",
                                    "label": "Attachments",
                                    "description": "Attachments linked to the company",
                                    "icon": "IconFileImport",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "1e57d284-4299-4c9e-8b19-36f9979bf583",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "29fc8ab6-b5fe-4a4c-bc23-2da8cbb5d6c4",
                                            "nameSingular": "company",
                                            "namePlural": "companies"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "b83f5915-d57b-4827-8c3e-141c508c2d8f",
                                            "name": "attachments"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b6c30b65-7822-4622-800c-5478baf15844",
                                            "nameSingular": "attachment",
                                            "namePlural": "attachments"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "255f9ab9-3bc9-42a0-bb8f-2bd0c40245eb",
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
                    "id": "294354c3-3156-446c-92a2-7a89a0f5abc5",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "383ee0f3-b7e4-46ad-9040-e73c3770a861",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "51c6d6ea-bd6e-4117-9713-89d88d6d6226",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "3c632605-39b2-452b-9dab-6edc8a084082",
                                    "type": "UUID",
                                    "name": "viewId",
                                    "label": "View id (foreign key)",
                                    "description": "View Field related view id foreign key",
                                    "icon": "IconLayoutCollage",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "383ee0f3-b7e4-46ad-9040-e73c3770a861",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "0118d585-b07b-43f2-96ad-51c944839555",
                                    "type": "UUID",
                                    "name": "fieldMetadataId",
                                    "label": "Field Metadata Id",
                                    "description": "View Field target field",
                                    "icon": "IconTag",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "76e3217b-9fb7-4eee-b372-6d949d5839df",
                                    "type": "NUMBER",
                                    "name": "size",
                                    "label": "Size",
                                    "description": "View Field size",
                                    "icon": "IconEye",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": 0,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "cc8a83de-c003-4537-ae86-b0f0d7e8f667",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "ed206642-caf5-45f6-be2b-0c0122c1a049",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "8ccd4f9d-496d-4ec1-bb8b-dd30e14deba4",
                                    "type": "BOOLEAN",
                                    "name": "isVisible",
                                    "label": "Visible",
                                    "description": "View Field visibility",
                                    "icon": "IconEye",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": true,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "ec17999e-523d-4177-99ed-7d66a57f584f",
                                    "type": "NUMBER",
                                    "name": "position",
                                    "label": "Position",
                                    "description": "View Field position",
                                    "icon": "IconList",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": 0,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b0035b5b-a7d6-45ce-a2ac-34eb8acb9e5c",
                                    "type": "RELATION",
                                    "name": "view",
                                    "label": "View",
                                    "description": "View Field related view",
                                    "icon": "IconLayoutCollage",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "b3c9ba61-85fd-4321-863a-8390fe57bcd5",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "294354c3-3156-446c-92a2-7a89a0f5abc5",
                                            "nameSingular": "viewField",
                                            "namePlural": "viewFields"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "b0035b5b-a7d6-45ce-a2ac-34eb8acb9e5c",
                                            "name": "view"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "e6155188-ccb3-4af9-9a60-9fb387cf19d6",
                                            "nameSingular": "view",
                                            "namePlural": "views"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "4be4ea49-93ac-486c-a477-069727bb7d58",
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
                    "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "b1c6b1f5-6fa7-4d39-a5dc-ce403aea77ba",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "13afeec4-0603-480b-9822-1b2bd5d24521",
                                    "type": "SELECT",
                                    "name": "timeFormat",
                                    "label": "Time format",
                                    "description": "User's preferred time format",
                                    "icon": "IconClock2",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'SYSTEM'",
                                    "options": [
                                        {
                                            "id": "a033f008-6170-4835-8052-950242c7072b",
                                            "color": "sky",
                                            "label": "System",
                                            "value": "SYSTEM",
                                            "position": 0
                                        },
                                        {
                                            "id": "bf3cc77a-21c5-46c9-b2c7-2aaac95e8979",
                                            "color": "red",
                                            "label": "24HRS",
                                            "value": "HOUR_24",
                                            "position": 1
                                        },
                                        {
                                            "id": "d89ffbb2-d6a7-481c-a99f-88ca2c5fc051",
                                            "color": "purple",
                                            "label": "12HRS",
                                            "value": "HOUR_12",
                                            "position": 2
                                        }
                                    ],
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "a60ee404-6efa-4bda-99cb-b8f012fd583c",
                                    "type": "RELATION",
                                    "name": "messageParticipants",
                                    "label": "Message Participants",
                                    "description": "Message Participants",
                                    "icon": "IconUserCircle",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "e71ed893-276c-4b6e-bd9c-6d145b2862b3",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "a60ee404-6efa-4bda-99cb-b8f012fd583c",
                                            "name": "messageParticipants"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "62c3eae9-09c6-4b98-9266-2d64772914cd",
                                            "nameSingular": "messageParticipant",
                                            "namePlural": "messageParticipants"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "81ff16fd-e545-4708-923b-3f46c36a9e04",
                                            "name": "workspaceMember"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "24bf2fbe-4be6-42bf-9780-6a89d9f4ba6c",
                                    "type": "RELATION",
                                    "name": "calendarEventParticipants",
                                    "label": "Calendar Event Participants",
                                    "description": "Calendar Event Participants",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "3d2aef73-82e8-4e2e-8d81-ceb8cc8e11b6",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "24bf2fbe-4be6-42bf-9780-6a89d9f4ba6c",
                                            "name": "calendarEventParticipants"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "10349622-e659-4f8e-84c6-1ad240fc5d3d",
                                            "nameSingular": "calendarEventParticipant",
                                            "namePlural": "calendarEventParticipants"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "a8e9f4ca-d58f-40de-bc49-356129315397",
                                            "name": "workspaceMember"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "93f61381-a8fa-480a-9873-f4203e48ab0a",
                                    "type": "RELATION",
                                    "name": "auditLogs",
                                    "label": "Audit Logs",
                                    "description": "Audit Logs linked to the workspace member",
                                    "icon": "IconTimelineEvent",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "5785ded3-3c7d-4b80-be36-6c96af08135b",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "93f61381-a8fa-480a-9873-f4203e48ab0a",
                                            "name": "auditLogs"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "57884046-eb9a-44d4-9c1b-ad3bd30ca5f3",
                                            "nameSingular": "auditLog",
                                            "namePlural": "auditLogs"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "ab0f9d59-8916-435a-9578-4ae5ee30a1c9",
                                            "name": "workspaceMember"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "dff3be1a-2ab9-4144-9b3d-3f4f42f843c9",
                                    "type": "TEXT",
                                    "name": "timeZone",
                                    "label": "Time zone",
                                    "description": "User time zone",
                                    "icon": "IconTimezone",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'system'",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "c5698e4b-7c7e-4d39-a524-e5bf46b05dd5",
                                    "type": "RELATION",
                                    "name": "timelineActivities",
                                    "label": "Events",
                                    "description": "Events linked to the workspace member",
                                    "icon": "IconTimelineEvent",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "13772cb9-ccbb-42eb-85a0-1b361b8dbd1e",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "c5698e4b-7c7e-4d39-a524-e5bf46b05dd5",
                                            "name": "timelineActivities"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "5bf3d57b-749f-4548-a27d-55ab942be344",
                                            "nameSingular": "timelineActivity",
                                            "namePlural": "timelineActivities"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "14d409c5-72f9-43b0-8df7-f3320868171e",
                                            "name": "workspaceMember"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "614723f8-c510-40d9-92cf-894122df9888",
                                    "type": "RELATION",
                                    "name": "authoredAttachments",
                                    "label": "Authored attachments",
                                    "description": "Attachments created by the workspace member",
                                    "icon": "IconFileImport",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "814dd3fd-e9c9-499f-b467-ec6d55b31d21",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "614723f8-c510-40d9-92cf-894122df9888",
                                            "name": "authoredAttachments"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b6c30b65-7822-4622-800c-5478baf15844",
                                            "nameSingular": "attachment",
                                            "namePlural": "attachments"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "104aa18c-2eef-4948-b1fd-cb41c1472725",
                                            "name": "author"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "175afe7b-6d80-40c5-a7b4-612c76d11c11",
                                    "type": "RELATION",
                                    "name": "accountOwnerForCompanies",
                                    "label": "Account Owner For Companies",
                                    "description": "Account owner for companies",
                                    "icon": "IconBriefcase",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "8d372fda-92c4-4400-a13f-ac2f6c57f7f0",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "175afe7b-6d80-40c5-a7b4-612c76d11c11",
                                            "name": "accountOwnerForCompanies"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "29fc8ab6-b5fe-4a4c-bc23-2da8cbb5d6c4",
                                            "nameSingular": "company",
                                            "namePlural": "companies"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "01faa409-63c0-40e6-91a7-f9ca2052ada3",
                                            "name": "accountOwner"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "e377d65f-963c-4bc3-916f-b23dae7bd3ea",
                                    "type": "RELATION",
                                    "name": "authoredComments",
                                    "label": "Authored comments",
                                    "description": "Authored comments",
                                    "icon": "IconComment",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "6d5b421a-82c5-4b68-ba88-64cc4d640336",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "e377d65f-963c-4bc3-916f-b23dae7bd3ea",
                                            "name": "authoredComments"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "df7a3973-337b-4619-a0f3-db487abef303",
                                            "nameSingular": "comment",
                                            "namePlural": "comments"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "e670baeb-2b1a-47b3-9fda-1fb8cd8c3ed7",
                                            "name": "author"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "9d45e105-cd9e-4e38-8b39-44b4ede52c3b",
                                    "type": "SELECT",
                                    "name": "dateFormat",
                                    "label": "Date format",
                                    "description": "User's preferred date format",
                                    "icon": "IconCalendarEvent",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'SYSTEM'",
                                    "options": [
                                        {
                                            "id": "102c2e02-9194-478a-b6b6-8e58b31d286e",
                                            "color": "turquoise",
                                            "label": "System",
                                            "value": "SYSTEM",
                                            "position": 0
                                        },
                                        {
                                            "id": "d93808dd-56f3-4698-bfad-de267533b21d",
                                            "color": "red",
                                            "label": "Month First",
                                            "value": "MONTH_FIRST",
                                            "position": 1
                                        },
                                        {
                                            "id": "295b9414-dd64-4216-b85c-d46cd1833347",
                                            "color": "purple",
                                            "label": "Day First",
                                            "value": "DAY_FIRST",
                                            "position": 2
                                        },
                                        {
                                            "id": "e60b5a6d-8de9-47a6-a882-b94f9fa5ab98",
                                            "color": "sky",
                                            "label": "Year First",
                                            "value": "YEAR_FIRST",
                                            "position": 3
                                        }
                                    ],
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "e1545d75-c4a7-4f5a-9e2e-24a260bd0c75",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "3fe9a0c1-787a-470b-b722-467d67a1fb9a",
                                    "type": "RELATION",
                                    "name": "connectedAccounts",
                                    "label": "Connected accounts",
                                    "description": "Connected accounts",
                                    "icon": "IconAt",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "f269a78d-1dcf-4807-8623-4dc3bc67c7af",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "3fe9a0c1-787a-470b-b722-467d67a1fb9a",
                                            "name": "connectedAccounts"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "f253841b-31ef-407b-baa7-a84e9d2fc0ef",
                                            "nameSingular": "connectedAccount",
                                            "namePlural": "connectedAccounts"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "7bf1c1fe-a367-4a38-9956-2f1e0f504b04",
                                            "name": "accountOwner"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "eb2aee07-cf60-4145-9acc-384c1c41a77c",
                                    "type": "RELATION",
                                    "name": "authoredActivities",
                                    "label": "Authored activities",
                                    "description": "Activities created by the workspace member",
                                    "icon": "IconCheckbox",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "3143e1f1-0bd1-4114-bf51-efd71378e7d8",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "eb2aee07-cf60-4145-9acc-384c1c41a77c",
                                            "name": "authoredActivities"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "53f58c52-b8d0-4eca-b5de-12be555c9d21",
                                            "nameSingular": "activity",
                                            "namePlural": "activities"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "b1c47d52-39d3-4f2f-90bb-48c7220d3b38",
                                            "name": "author"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f5cf3c77-402e-4d2b-ac64-2ba2f1001e24",
                                    "type": "RELATION",
                                    "name": "blocklist",
                                    "label": "Blocklist",
                                    "description": "Blocklisted handles",
                                    "icon": "IconForbid2",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "fefbfc90-f91d-453f-8cdd-739fd6dea91a",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "f5cf3c77-402e-4d2b-ac64-2ba2f1001e24",
                                            "name": "blocklist"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "d872697d-ed6a-4e07-9d3a-b43930378048",
                                            "nameSingular": "blocklist",
                                            "namePlural": "blocklists"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "1e57e6c3-5f31-4a47-8832-8b921209b92f",
                                            "name": "workspaceMember"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "592b3c80-d5b4-4dde-b4cb-06855796c4ee",
                                    "type": "TEXT",
                                    "name": "userEmail",
                                    "label": "User Email",
                                    "description": "Related user email address",
                                    "icon": "IconMail",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "5233b10a-b59f-4743-bd5d-58b89dcaaa9a",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "1b5ff5e1-403b-4176-99a5-709710d5c977",
                                    "type": "TEXT",
                                    "name": "colorScheme",
                                    "label": "Color Scheme",
                                    "description": "Preferred color scheme",
                                    "icon": "IconColorSwatch",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'Light'",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "3dc0a67f-5695-4f7c-9b78-3ac6a0fa2758",
                                    "type": "RELATION",
                                    "name": "assignedActivities",
                                    "label": "Assigned activities",
                                    "description": "Activities assigned to the workspace member",
                                    "icon": "IconCheckbox",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "0c0ada9f-6748-4a1f-9dc0-3f3d79c032ef",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "3dc0a67f-5695-4f7c-9b78-3ac6a0fa2758",
                                            "name": "assignedActivities"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "53f58c52-b8d0-4eca-b5de-12be555c9d21",
                                            "nameSingular": "activity",
                                            "namePlural": "activities"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "2bff7da5-a294-45ee-b3e7-c0f1671077d0",
                                            "name": "assignee"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "284366a9-8855-4ba7-adc9-79f68deaf655",
                                    "type": "UUID",
                                    "name": "userId",
                                    "label": "User Id",
                                    "description": "Associated User Id",
                                    "icon": "IconCircleUsers",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b1c6b1f5-6fa7-4d39-a5dc-ce403aea77ba",
                                    "type": "FULL_NAME",
                                    "name": "name",
                                    "label": "Name",
                                    "description": "Workspace member name",
                                    "icon": "IconCircleUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": {
                                        "lastName": "''",
                                        "firstName": "''"
                                    },
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "61c73b37-76e6-4b71-a31d-375f57983cba",
                                    "type": "RELATION",
                                    "name": "assignedTasks",
                                    "label": "Assigned tasks",
                                    "description": "Tasks assigned to the workspace member",
                                    "icon": "IconCheckbox",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "64e5ff21-4357-481a-858a-efdc8b61df72",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "61c73b37-76e6-4b71-a31d-375f57983cba",
                                            "name": "assignedTasks"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "fa9c493a-8468-4141-807f-5a3999614474",
                                            "nameSingular": "task",
                                            "namePlural": "tasks"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "8bc55e5a-c1d9-4943-b882-20dc6f0d392a",
                                            "name": "assignee"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "c106d789-66e3-4f91-8e03-cc105b2f82f1",
                                    "type": "RELATION",
                                    "name": "favorites",
                                    "label": "Favorites",
                                    "description": "Favorites linked to the workspace member",
                                    "icon": "IconHeart",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "fd3ecd57-aef0-4cb4-9bc9-0a53f9b2609e",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "c106d789-66e3-4f91-8e03-cc105b2f82f1",
                                            "name": "favorites"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "b2417845-c5d5-4d5e-8f6a-5a2eafca2983",
                                            "nameSingular": "favorite",
                                            "namePlural": "favorites"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "86b47c9c-1c99-4ada-ade1-6d1326be048b",
                                            "name": "workspaceMember"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "c6bb18a3-2858-4b06-bf2a-2d49180e1f46",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "704eec6d-3aa7-44cd-8c29-a8b943e1c22b",
                                    "type": "TEXT",
                                    "name": "locale",
                                    "label": "Language",
                                    "description": "Preferred language",
                                    "icon": "IconLanguage",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'en'",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "c5973187-35e6-4e9c-94ca-7f0027c8ec12",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "3a64ae25-bf37-4753-a878-48c281a6b667",
                                    "type": "TEXT",
                                    "name": "avatarUrl",
                                    "label": "Avatar Url",
                                    "description": "Workspace member avatar",
                                    "icon": "IconFileUpload",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
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
                    "id": "10349622-e659-4f8e-84c6-1ad240fc5d3d",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "12624323-339e-4f39-97c8-e6489d236231",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "303e9a70-c0a5-4a7b-ad85-73f7178ae957",
                                    "type": "UUID",
                                    "name": "calendarEventId",
                                    "label": "Event ID id (foreign key)",
                                    "description": "Event ID id foreign key",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "42f41cdc-dc98-4c69-8ee9-d3c48732492e",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "81cc359b-228b-4df0-8ee3-c75d403a65f3",
                                    "type": "UUID",
                                    "name": "personId",
                                    "label": "Person id (foreign key)",
                                    "description": "Person id foreign key",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "cc59fcf8-c5eb-425a-bdd9-47586a6860ea",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "8fee3e0f-d886-4ec7-b39d-64c9f61ac6fc",
                                    "type": "RELATION",
                                    "name": "calendarEvent",
                                    "label": "Event ID",
                                    "description": "Event ID",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "307a8ea7-0293-458d-80e7-3d5fed101c6f",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "10349622-e659-4f8e-84c6-1ad240fc5d3d",
                                            "nameSingular": "calendarEventParticipant",
                                            "namePlural": "calendarEventParticipants"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "8fee3e0f-d886-4ec7-b39d-64c9f61ac6fc",
                                            "name": "calendarEvent"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "77ca5b71-cf5b-45a4-8235-785f2516038c",
                                            "nameSingular": "calendarEvent",
                                            "namePlural": "calendarEvents"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "b2e122f6-7aa8-4344-869a-31dd1a1ac393",
                                            "name": "calendarEventParticipants"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "327237c5-8e32-4617-bc2a-0ebb7500c751",
                                    "type": "BOOLEAN",
                                    "name": "isOrganizer",
                                    "label": "Is Organizer",
                                    "description": "Is Organizer",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": false,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "a8e9f4ca-d58f-40de-bc49-356129315397",
                                    "type": "RELATION",
                                    "name": "workspaceMember",
                                    "label": "Workspace Member",
                                    "description": "Workspace Member",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "3d2aef73-82e8-4e2e-8d81-ceb8cc8e11b6",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "10349622-e659-4f8e-84c6-1ad240fc5d3d",
                                            "nameSingular": "calendarEventParticipant",
                                            "namePlural": "calendarEventParticipants"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "a8e9f4ca-d58f-40de-bc49-356129315397",
                                            "name": "workspaceMember"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "173b58f6-45bb-4755-918d-e6e116df0e65",
                                            "nameSingular": "workspaceMember",
                                            "namePlural": "workspaceMembers"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "24bf2fbe-4be6-42bf-9780-6a89d9f4ba6c",
                                            "name": "calendarEventParticipants"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "e0322596-3a51-49a0-b36f-ce3e0f5cc495",
                                    "type": "RELATION",
                                    "name": "person",
                                    "label": "Person",
                                    "description": "Person",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "0b781662-92fe-496e-9078-d86e912d2eff",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "10349622-e659-4f8e-84c6-1ad240fc5d3d",
                                            "nameSingular": "calendarEventParticipant",
                                            "namePlural": "calendarEventParticipants"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "e0322596-3a51-49a0-b36f-ce3e0f5cc495",
                                            "name": "person"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8d5b1e3c-a76c-4171-90e4-fba40f894af9",
                                            "nameSingular": "person",
                                            "namePlural": "people"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "ec76cfb0-de70-4cfc-bd64-ba877dc20854",
                                            "name": "calendarEventParticipants"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "ab1f8c15-e4aa-4e0d-b144-8951cd364adc",
                                    "type": "UUID",
                                    "name": "workspaceMemberId",
                                    "label": "Workspace Member id (foreign key)",
                                    "description": "Workspace Member id foreign key",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "aaa87cca-e77a-43a2-ba99-603fd71b9255",
                                    "type": "SELECT",
                                    "name": "responseStatus",
                                    "label": "Response Status",
                                    "description": "Response Status",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'NEEDS_ACTION'",
                                    "options": [
                                        {
                                            "id": "737a6929-a33c-43d9-a9d7-5df64df9641d",
                                            "color": "orange",
                                            "label": "Needs Action",
                                            "value": "NEEDS_ACTION",
                                            "position": 0
                                        },
                                        {
                                            "id": "f9292096-129a-4473-a46c-efc08b66f490",
                                            "color": "red",
                                            "label": "Declined",
                                            "value": "DECLINED",
                                            "position": 1
                                        },
                                        {
                                            "id": "39498100-31c3-4266-accd-3f59fec2a9a8",
                                            "color": "yellow",
                                            "label": "Tentative",
                                            "value": "TENTATIVE",
                                            "position": 2
                                        },
                                        {
                                            "id": "2bbbe79e-4b80-4b05-8188-32d55c7cb9ac",
                                            "color": "green",
                                            "label": "Accepted",
                                            "value": "ACCEPTED",
                                            "position": 3
                                        }
                                    ],
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "eaee5825-ec19-44b1-ad90-5094eda58b40",
                                    "type": "TEXT",
                                    "name": "displayName",
                                    "label": "Display Name",
                                    "description": "Display Name",
                                    "icon": "IconUser",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "12624323-339e-4f39-97c8-e6489d236231",
                                    "type": "TEXT",
                                    "name": "handle",
                                    "label": "Handle",
                                    "description": "Handle",
                                    "icon": "IconMail",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "50ec72ec-af02-4beb-a753-941af593c601",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f5466e8b-85e5-44fc-98ad-feedbe40f399",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
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
                    "id": "0cfee9a3-37c4-4463-8069-684f9b4f48a1",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "29ed0508-476f-40c8-806b-4642cd331b9b",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "b2a3acb7-1349-4b99-8ba7-0c57f71d163e",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "2cb695c3-cd9b-40c4-ae10-14c5077222b7",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "29ed0508-476f-40c8-806b-4642cd331b9b",
                                    "type": "TEXT",
                                    "name": "targetUrl",
                                    "label": "Target Url",
                                    "description": "Webhook target url",
                                    "icon": "IconLink",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "af089b4d-c14d-4da2-9f98-dff418bfa91e",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "88bfc974-1e8a-4373-b600-03bae1dec7c0",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "9738a8db-24ca-4784-a0d2-aa2eaa766042",
                                    "type": "TEXT",
                                    "name": "description",
                                    "label": "Description",
                                    "description": null,
                                    "icon": "IconInfo",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "18eaba09-9be5-43c8-bd4f-d3c0f867f888",
                                    "type": "TEXT",
                                    "name": "operation",
                                    "label": "Operation",
                                    "description": "Webhook operation",
                                    "icon": "IconCheckbox",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
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
                    "id": "0c25904e-f217-4108-a253-47c123d69fe7",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "af0452ae-36cc-4f29-9531-ce312a3e9956",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "e423f09d-1b9a-4600-b89c-ce42a0a0ec44",
                                    "type": "RELATION",
                                    "name": "view",
                                    "label": "View",
                                    "description": "View Filter related view",
                                    "icon": "IconLayoutCollage",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "2d589b5c-9933-4493-9771-6915edbe1c1f",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "0c25904e-f217-4108-a253-47c123d69fe7",
                                            "nameSingular": "viewFilter",
                                            "namePlural": "viewFilters"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "e423f09d-1b9a-4600-b89c-ce42a0a0ec44",
                                            "name": "view"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "e6155188-ccb3-4af9-9a60-9fb387cf19d6",
                                            "nameSingular": "view",
                                            "namePlural": "views"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "b6e824b8-89c3-4888-8951-518ee5e2bf5b",
                                            "name": "viewFilters"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "f98e20dc-4e6a-4867-a110-e809175c6da3",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "af0452ae-36cc-4f29-9531-ce312a3e9956",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "b43c0ea1-2cdc-4548-8b41-b87b646ed1aa",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "d95f04bb-b81b-4f28-8583-1aae16363065",
                                    "type": "TEXT",
                                    "name": "operand",
                                    "label": "Operand",
                                    "description": "View Filter operand",
                                    "icon": null,
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "'Contains'",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "5139561b-8c61-45c7-9721-e5ca64ae5c65",
                                    "type": "UUID",
                                    "name": "viewId",
                                    "label": "View id (foreign key)",
                                    "description": "View Filter related view id foreign key",
                                    "icon": "IconLayoutCollage",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "629b55cc-c85b-4301-be8b-71bc292bd23e",
                                    "type": "TEXT",
                                    "name": "displayValue",
                                    "label": "Display Value",
                                    "description": "View Filter Display Value",
                                    "icon": null,
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "31f7ed06-1a47-4f40-8906-91cab10e74fc",
                                    "type": "TEXT",
                                    "name": "value",
                                    "label": "Value",
                                    "description": "View Filter value",
                                    "icon": null,
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "c3869664-1c8f-4607-baaf-dcc587cd10d4",
                                    "type": "UUID",
                                    "name": "fieldMetadataId",
                                    "label": "Field Metadata Id",
                                    "description": "View Filter target field",
                                    "icon": null,
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "9bc32367-f9fb-4925-847e-0869d7303014",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
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
                    "id": "0b08226c-bbd9-46e6-aff7-60a8962c78b7",
                    "dataSourceId": "85e166e5-abfd-4e01-8536-fa4f78f03cd0",
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
                    "createdAt": "2024-09-20T08:51:58.119Z",
                    "updatedAt": "2024-09-20T08:51:58.119Z",
                    "labelIdentifierFieldMetadataId": "00a3bb5b-13d9-4b89-892e-1a081067f71f",
                    "imageIdentifierFieldMetadataId": null,
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
                                    "id": "4271bc4e-06ba-45b0-95ff-4ddfcccb8241",
                                    "type": "RELATION",
                                    "name": "messageParticipants",
                                    "label": "Message Participants",
                                    "description": "Message Participants",
                                    "icon": "IconUserCircle",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "774cb6b5-f838-40ca-ac38-d864957e8da6",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "0b08226c-bbd9-46e6-aff7-60a8962c78b7",
                                            "nameSingular": "message",
                                            "namePlural": "messages"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "4271bc4e-06ba-45b0-95ff-4ddfcccb8241",
                                            "name": "messageParticipants"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "62c3eae9-09c6-4b98-9266-2d64772914cd",
                                            "nameSingular": "messageParticipant",
                                            "namePlural": "messageParticipants"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "741d55c3-27c2-441f-88fe-0ee2b7a21fbf",
                                            "name": "message"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "ab31176e-2186-4642-bb6a-266c0a701f00",
                                    "type": "RELATION",
                                    "name": "messageThread",
                                    "label": "Message Thread Id",
                                    "description": "Message Thread Id",
                                    "icon": "IconHash",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "6f1b6a0c-63ab-42c6-b770-6f160cdb5b25",
                                        "direction": "MANY_TO_ONE",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "0b08226c-bbd9-46e6-aff7-60a8962c78b7",
                                            "nameSingular": "message",
                                            "namePlural": "messages"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "ab31176e-2186-4642-bb6a-266c0a701f00",
                                            "name": "messageThread"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "8d33577d-719a-46a0-b176-d7d5c3711db9",
                                            "nameSingular": "messageThread",
                                            "namePlural": "messageThreads"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "dc168834-2299-4c0a-ac4f-221cb7855498",
                                            "name": "messages"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "1142f432-fe41-47b3-810b-949f6bf5da3f",
                                    "type": "DATE_TIME",
                                    "name": "updatedAt",
                                    "label": "Last update",
                                    "description": "Last time the record was changed",
                                    "icon": "IconCalendarClock",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "cddb33e5-6f4d-4360-836c-fb5f550c639c",
                                    "type": "UUID",
                                    "name": "id",
                                    "label": "Id",
                                    "description": "Id",
                                    "icon": "Icon123",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "uuid",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "03c7b256-f5cd-4be3-889a-515268bca510",
                                    "type": "TEXT",
                                    "name": "text",
                                    "label": "Text",
                                    "description": "Text",
                                    "icon": "IconMessage",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "341ab002-d4ea-4fba-af25-88de31060f84",
                                    "type": "DATE_TIME",
                                    "name": "createdAt",
                                    "label": "Creation date",
                                    "description": "Creation date",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "now",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "00a3bb5b-13d9-4b89-892e-1a081067f71f",
                                    "type": "TEXT",
                                    "name": "subject",
                                    "label": "Subject",
                                    "description": "Subject",
                                    "icon": "IconMessage",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "ec93c3cf-21fc-499a-8033-4569b7ed6270",
                                    "type": "DATE_TIME",
                                    "name": "deletedAt",
                                    "label": "Deleted at",
                                    "description": "Date when the record was deleted",
                                    "icon": "IconCalendarMinus",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "cd964684-8d47-4ae5-a69a-299f46fdbefc",
                                    "type": "UUID",
                                    "name": "messageThreadId",
                                    "label": "Message Thread Id id (foreign key)",
                                    "description": "Message Thread Id id foreign key",
                                    "icon": "IconHash",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "d363806e-173b-461a-9d43-2bb69cb03e7a",
                                    "type": "DATE_TIME",
                                    "name": "receivedAt",
                                    "label": "Received At",
                                    "description": "The date the message was received",
                                    "icon": "IconCalendar",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": null
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "5f47efc7-13c1-4980-89a9-3d2752049c08",
                                    "type": "RELATION",
                                    "name": "messageChannelMessageAssociations",
                                    "label": "Message Channel Association",
                                    "description": "Messages from the channel.",
                                    "icon": "IconMessage",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": true,
                                    "isNullable": true,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": null,
                                    "options": null,
                                    "relationDefinition": {
                                        "__typename": "RelationDefinition",
                                        "relationId": "5d28b08d-81c6-4531-a6de-3820125a5643",
                                        "direction": "ONE_TO_MANY",
                                        "sourceObjectMetadata": {
                                            "__typename": "object",
                                            "id": "0b08226c-bbd9-46e6-aff7-60a8962c78b7",
                                            "nameSingular": "message",
                                            "namePlural": "messages"
                                        },
                                        "sourceFieldMetadata": {
                                            "__typename": "field",
                                            "id": "5f47efc7-13c1-4980-89a9-3d2752049c08",
                                            "name": "messageChannelMessageAssociations"
                                        },
                                        "targetObjectMetadata": {
                                            "__typename": "object",
                                            "id": "ce846485-e54e-4094-9c34-50f0e8dce971",
                                            "nameSingular": "messageChannelMessageAssociation",
                                            "namePlural": "messageChannelMessageAssociations"
                                        },
                                        "targetFieldMetadata": {
                                            "__typename": "field",
                                            "id": "72de8fa6-e4bd-4ccf-94e9-bbe2c4ed42a2",
                                            "name": "message"
                                        }
                                    }
                                }
                            },
                            {
                                "__typename": "fieldEdge",
                                "node": {
                                    "__typename": "field",
                                    "id": "07ac82f9-a209-42f0-b8fc-4008a96c53f0",
                                    "type": "TEXT",
                                    "name": "headerMessageId",
                                    "label": "Header message Id",
                                    "description": "Message id from the message header",
                                    "icon": "IconHash",
                                    "isCustom": false,
                                    "isActive": true,
                                    "isSystem": false,
                                    "isNullable": false,
                                    "createdAt": "2024-09-20T08:51:58.119Z",
                                    "updatedAt": "2024-09-20T08:51:58.119Z",
                                    "defaultValue": "''",
                                    "options": null,
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

