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
        "endCursor": "YXJyYXljb25uZWN0aW9uOjMx"
    },
    "edges": [
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "e095e196-08d4-493c-8a02-01c4a3decb5c",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "b2b89347-48a2-4f0c-a176-ad10ae33b7b1",
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
                                "id": "0e545220-a625-4571-a8e7-f97b7aee90c1",
                                "type": "UUID",
                                "name": "noteId",
                                "label": "Note id (foreign key)",
                                "description": "Event note id foreign key",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "987fd4f6-4c5f-48a4-82f3-fd769de80dc4",
                                "type": "RELATION",
                                "name": "opportunity",
                                "label": "Opportunity",
                                "description": "Event opportunity",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "d8ae1b79-b532-412c-92cf-767a32e3cda2",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e095e196-08d4-493c-8a02-01c4a3decb5c",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "987fd4f6-4c5f-48a4-82f3-fd769de80dc4",
                                        "name": "opportunity"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "4e24ba90-8fcd-4df5-9fe8-48679c75d374",
                                        "name": "timelineActivities"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "d8ae1b79-b532-412c-92cf-767a32e3cda2",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "4e24ba90-8fcd-4df5-9fe8-48679c75d374",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "ce28e696-4969-4e06-9056-6a176d9d7c90",
                                "type": "UUID",
                                "name": "linkedObjectMetadataId",
                                "label": "Linked Object Metadata Id",
                                "description": "inked Object Metadata Id",
                                "icon": "IconAbc",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "e48eeafe-43d8-4abc-95c8-6e7a6a56a7c9",
                                "type": "RELATION",
                                "name": "task",
                                "label": "Task",
                                "description": "Event task",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "87c0082f-5411-4202-97cd-fc1d9112fa7a",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e095e196-08d4-493c-8a02-01c4a3decb5c",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "e48eeafe-43d8-4abc-95c8-6e7a6a56a7c9",
                                        "name": "task"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4601f72c-580d-4e64-8004-4864f5e60da7",
                                        "nameSingular": "task",
                                        "namePlural": "tasks"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "975e6a19-d90c-45dc-9bb0-ffc57f4e1950",
                                        "name": "timelineActivities"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "87c0082f-5411-4202-97cd-fc1d9112fa7a",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "975e6a19-d90c-45dc-9bb0-ffc57f4e1950",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4601f72c-580d-4e64-8004-4864f5e60da7",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "task",
                                        "namePlural": "tasks",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "b2b89347-48a2-4f0c-a176-ad10ae33b7b1",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "0224c08b-2c2e-474f-8360-dafad378cf62",
                                "type": "RELATION",
                                "name": "company",
                                "label": "Company",
                                "description": "Event company",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "1e93ed03-91a5-4ad4-bca7-c6a637551289",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e095e196-08d4-493c-8a02-01c4a3decb5c",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "0224c08b-2c2e-474f-8360-dafad378cf62",
                                        "name": "company"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "f39f1db9-3d7f-46d3-aa0c-4cae44352407",
                                        "name": "timelineActivities"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "1e93ed03-91a5-4ad4-bca7-c6a637551289",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "f39f1db9-3d7f-46d3-aa0c-4cae44352407",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "company",
                                        "namePlural": "companies",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "0669197c-bc4e-4a44-9cd9-db449bfa380e",
                                "type": "RELATION",
                                "name": "person",
                                "label": "Person",
                                "description": "Event person",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "680351ba-8759-405d-8fda-90799bf75741",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e095e196-08d4-493c-8a02-01c4a3decb5c",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "0669197c-bc4e-4a44-9cd9-db449bfa380e",
                                        "name": "person"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "3700e772-3bf6-4150-b5ce-f7f00ded863a",
                                        "name": "timelineActivities"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "680351ba-8759-405d-8fda-90799bf75741",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "3700e772-3bf6-4150-b5ce-f7f00ded863a",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "person",
                                        "namePlural": "people",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "a3a51b55-8387-412f-8661-cbaf58bde346",
                                "type": "UUID",
                                "name": "personId",
                                "label": "Person id (foreign key)",
                                "description": "Event person id foreign key",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "f064e57f-26ea-4aa5-9f95-eda25af30f0f",
                                "type": "DATE_TIME",
                                "name": "happensAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "bc0e2a25-4e13-4751-a79a-2d264582ef9a",
                                "type": "RELATION",
                                "name": "note",
                                "label": "Note",
                                "description": "Event note",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "7ec36219-a377-4aea-98be-7954590f8a32",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e095e196-08d4-493c-8a02-01c4a3decb5c",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "bc0e2a25-4e13-4751-a79a-2d264582ef9a",
                                        "name": "note"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4cd6194a-093e-4c5d-9ff2-218970b01e3c",
                                        "nameSingular": "note",
                                        "namePlural": "notes"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "b66379fc-ac94-4823-b759-aa940fde9c73",
                                        "name": "timelineActivities"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "7ec36219-a377-4aea-98be-7954590f8a32",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "b66379fc-ac94-4823-b759-aa940fde9c73",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4cd6194a-093e-4c5d-9ff2-218970b01e3c",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "note",
                                        "namePlural": "notes",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "ae929592-4f74-419e-8b26-6d216859078f",
                                "type": "RAW_JSON",
                                "name": "properties",
                                "label": "Event details",
                                "description": "Json value for event details",
                                "icon": "IconListDetails",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "64a86ebc-93d3-47f2-a013-0e6c8ef2af18",
                                "type": "TEXT",
                                "name": "name",
                                "label": "Event name",
                                "description": "Event name",
                                "icon": "IconAbc",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "7df779f8-89a1-4c41-9868-0d98f53b29aa",
                                "type": "UUID",
                                "name": "companyId",
                                "label": "Company id (foreign key)",
                                "description": "Event company id foreign key",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "cf56c3f4-dd93-465c-8ab3-edbd6cc5f246",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "27cf8bcc-101c-42e1-999f-32365e0abc80",
                                "type": "UUID",
                                "name": "opportunityId",
                                "label": "Opportunity id (foreign key)",
                                "description": "Event opportunity id foreign key",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "9ddef7df-ec3c-42b6-b279-ffb60dbf5a8a",
                                "type": "UUID",
                                "name": "linkedRecordId",
                                "label": "Linked Record id",
                                "description": "Linked Record id",
                                "icon": "IconAbc",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "f465561a-ea75-46e7-8110-dd4ed4f25f72",
                                "type": "TEXT",
                                "name": "linkedRecordCachedName",
                                "label": "Linked Record cached name",
                                "description": "Cached record name",
                                "icon": "IconAbc",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "b7d464b1-d234-4295-9845-bed07dbc41e4",
                                "type": "UUID",
                                "name": "taskId",
                                "label": "Task id (foreign key)",
                                "description": "Event task id foreign key",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "63ec5746-623a-41d5-8ed8-aca9577102eb",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "9fc19fe9-2563-41ac-8c92-2062ff3a0c0c",
                                "type": "RELATION",
                                "name": "workspaceMember",
                                "label": "Workspace Member",
                                "description": "Event workspace member",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "5b2015dd-3fac-4118-adf5-3cceede873eb",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e095e196-08d4-493c-8a02-01c4a3decb5c",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "9fc19fe9-2563-41ac-8c92-2062ff3a0c0c",
                                        "name": "workspaceMember"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "ace8a324-075e-49a3-92fa-34e07590ec72",
                                        "name": "timelineActivities"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "5b2015dd-3fac-4118-adf5-3cceede873eb",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "ace8a324-075e-49a3-92fa-34e07590ec72",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "d59ec465-34c7-471d-9c20-7be1f081d4cd",
                                "type": "UUID",
                                "name": "workspaceMemberId",
                                "label": "Workspace Member id (foreign key)",
                                "description": "Event workspace member id foreign key",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "dfdcf91e-f4b4-4460-8c89-919ef501fd79",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "34c76e0d-23e5-476a-bd56-2f9b02eae3ea",
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
                                "id": "74b4d296-dfde-40b4-b6aa-012a17ef6451",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "138ee2a7-7f7e-4901-b5d2-7ccc13a0bc38",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "906714b3-0268-49bb-85b4-705587e6f4c1",
                                "type": "SELECT",
                                "name": "direction",
                                "label": "Direction",
                                "description": "Message Direction",
                                "icon": "IconDirection",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "'incoming'",
                                "options": [
                                    {
                                        "id": "09fd3f5f-5903-4a3a-8f8b-335825349389",
                                        "color": "green",
                                        "label": "Incoming",
                                        "value": "incoming",
                                        "position": 0
                                    },
                                    {
                                        "id": "0df4272e-dfef-450e-84b7-d1477e66ee7f",
                                        "color": "blue",
                                        "label": "Outgoing",
                                        "value": "outgoing",
                                        "position": 1
                                    }
                                ],
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "114f853e-2684-4e62-92c9-0213ace3c498",
                                "type": "RELATION",
                                "name": "messageThread",
                                "label": "Message Thread Id",
                                "description": "Message Thread Id",
                                "icon": "IconHash",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "c958fe88-7d66-4c1b-87c7-55ab724f42c5",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dfdcf91e-f4b4-4460-8c89-919ef501fd79",
                                        "nameSingular": "message",
                                        "namePlural": "messages"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "114f853e-2684-4e62-92c9-0213ace3c498",
                                        "name": "messageThread"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "1f73c3c3-a356-4a70-8a91-948e70120fdf",
                                        "nameSingular": "messageThread",
                                        "namePlural": "messageThreads"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "9016096d-93c4-495f-93d5-b966e5bedc74",
                                        "name": "messages"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "c958fe88-7d66-4c1b-87c7-55ab724f42c5",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "9016096d-93c4-495f-93d5-b966e5bedc74",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "1f73c3c3-a356-4a70-8a91-948e70120fdf",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "messageThread",
                                        "namePlural": "messageThreads",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "0837697b-286c-43e2-9364-532d5e06cd76",
                                "type": "DATE_TIME",
                                "name": "receivedAt",
                                "label": "Received At",
                                "description": "The date the message was received",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "f6a6d3f8-fef7-4d91-b187-7ea8d6291372",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "15658254-6562-4fad-9ef3-393f913e95c2",
                                "type": "RELATION",
                                "name": "messageParticipants",
                                "label": "Message Participants",
                                "description": "Message Participants",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "2180d888-98dc-428e-a157-c30ce7bf8ce4",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dfdcf91e-f4b4-4460-8c89-919ef501fd79",
                                        "nameSingular": "message",
                                        "namePlural": "messages"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "15658254-6562-4fad-9ef3-393f913e95c2",
                                        "name": "messageParticipants"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0c0a3db9-f3ba-485a-8dff-488c477f3fa6",
                                        "nameSingular": "messageParticipant",
                                        "namePlural": "messageParticipants"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "660b4257-010e-4039-897a-e274f2559ed5",
                                        "name": "message"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "2180d888-98dc-428e-a157-c30ce7bf8ce4",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "660b4257-010e-4039-897a-e274f2559ed5",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0c0a3db9-f3ba-485a-8dff-488c477f3fa6",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "messageParticipant",
                                        "namePlural": "messageParticipants",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "c4f2dcde-1110-419e-8590-dd1a26a0dfec",
                                "type": "UUID",
                                "name": "messageThreadId",
                                "label": "Message Thread Id id (foreign key)",
                                "description": "Message Thread Id id foreign key",
                                "icon": "IconHash",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "eb2e56c5-db83-4844-9179-3890e31edf15",
                                "type": "TEXT",
                                "name": "headerMessageId",
                                "label": "Header message Id",
                                "description": "Message id from the message header",
                                "icon": "IconHash",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "2ac789bf-ce05-4f0e-9f04-f848f93c2f21",
                                "type": "RELATION",
                                "name": "messageChannelMessageAssociations",
                                "label": "Message Channel Association",
                                "description": "Messages from the channel.",
                                "icon": "IconMessage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "642b4d8c-f2f8-4590-abce-4b112d8689ba",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dfdcf91e-f4b4-4460-8c89-919ef501fd79",
                                        "nameSingular": "message",
                                        "namePlural": "messages"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "2ac789bf-ce05-4f0e-9f04-f848f93c2f21",
                                        "name": "messageChannelMessageAssociations"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0985d46f-722d-468f-9fa6-efa219405aa7",
                                        "nameSingular": "messageChannelMessageAssociation",
                                        "namePlural": "messageChannelMessageAssociations"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "785c0609-42b8-4b0e-b7c2-4d54b6ed651f",
                                        "name": "message"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "642b4d8c-f2f8-4590-abce-4b112d8689ba",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "785c0609-42b8-4b0e-b7c2-4d54b6ed651f",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0985d46f-722d-468f-9fa6-efa219405aa7",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "messageChannelMessageAssociation",
                                        "namePlural": "messageChannelMessageAssociations",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "0b97d62c-af50-48e2-af87-eaedc63c17ee",
                                "type": "TEXT",
                                "name": "text",
                                "label": "Text",
                                "description": "Text",
                                "icon": "IconMessage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "34c76e0d-23e5-476a-bd56-2f9b02eae3ea",
                                "type": "TEXT",
                                "name": "subject",
                                "label": "Subject",
                                "description": "Subject",
                                "icon": "IconMessage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "dcb774a3-71e8-44cc-bf53-7f195e0bfdb6",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "e97affc0-248a-4f3b-b1c5-f46f3d1edd21",
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
                                "id": "5b2ec790-e8b8-4bd0-bf1b-db4ebc2b473a",
                                "type": "RELATION",
                                "name": "opportunity",
                                "label": "Opportunity",
                                "description": "NoteTarget opportunity",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "c0946e53-4cdd-46b4-b30a-9fce040b9a7a",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dcb774a3-71e8-44cc-bf53-7f195e0bfdb6",
                                        "nameSingular": "noteTarget",
                                        "namePlural": "noteTargets"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5b2ec790-e8b8-4bd0-bf1b-db4ebc2b473a",
                                        "name": "opportunity"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "e6fe20c1-091e-418f-9ff0-8ea7cfb864f8",
                                        "name": "noteTargets"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "c0946e53-4cdd-46b4-b30a-9fce040b9a7a",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "e6fe20c1-091e-418f-9ff0-8ea7cfb864f8",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "be09126d-4c9e-42d1-b686-cd43c4aa32df",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "87334d50-0c5d-4327-a8c5-3db6bc28c1ea",
                                "type": "RELATION",
                                "name": "note",
                                "label": "Note",
                                "description": "NoteTarget note",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "663e9842-8b92-451a-bf73-12a886ff8b05",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dcb774a3-71e8-44cc-bf53-7f195e0bfdb6",
                                        "nameSingular": "noteTarget",
                                        "namePlural": "noteTargets"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "87334d50-0c5d-4327-a8c5-3db6bc28c1ea",
                                        "name": "note"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4cd6194a-093e-4c5d-9ff2-218970b01e3c",
                                        "nameSingular": "note",
                                        "namePlural": "notes"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "04794a4e-35c3-46a9-8bf3-8ba1c0324f0b",
                                        "name": "noteTargets"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "663e9842-8b92-451a-bf73-12a886ff8b05",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "04794a4e-35c3-46a9-8bf3-8ba1c0324f0b",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4cd6194a-093e-4c5d-9ff2-218970b01e3c",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "note",
                                        "namePlural": "notes",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "9025db40-92fb-4fd5-9df3-c5bbf2878e61",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "12ccd632-bfd4-47e7-80dc-4c3f913372f6",
                                "type": "UUID",
                                "name": "noteId",
                                "label": "Note id (foreign key)",
                                "description": "NoteTarget note id foreign key",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "f90c9e4d-c3d4-43d2-9697-9307e373669d",
                                "type": "UUID",
                                "name": "personId",
                                "label": "Person id (foreign key)",
                                "description": "NoteTarget person id foreign key",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "8ac4df39-f1a0-4221-a605-bd4c229fbc12",
                                "type": "RELATION",
                                "name": "person",
                                "label": "Person",
                                "description": "NoteTarget person",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "700c5e52-3e7b-4471-9826-82270c03c37e",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dcb774a3-71e8-44cc-bf53-7f195e0bfdb6",
                                        "nameSingular": "noteTarget",
                                        "namePlural": "noteTargets"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "8ac4df39-f1a0-4221-a605-bd4c229fbc12",
                                        "name": "person"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "82d1a637-3df9-4d59-a412-1cbc1d92baf2",
                                        "name": "noteTargets"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "700c5e52-3e7b-4471-9826-82270c03c37e",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "82d1a637-3df9-4d59-a412-1cbc1d92baf2",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "person",
                                        "namePlural": "people",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "e97affc0-248a-4f3b-b1c5-f46f3d1edd21",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "b92459f6-3ab6-4b8f-855e-a759b45118df",
                                "type": "UUID",
                                "name": "opportunityId",
                                "label": "Opportunity id (foreign key)",
                                "description": "NoteTarget opportunity id foreign key",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "662f602c-a292-489e-b784-476168f1efcb",
                                "type": "UUID",
                                "name": "companyId",
                                "label": "Company id (foreign key)",
                                "description": "NoteTarget company id foreign key",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "5a0243d0-051b-4f30-b0d2-da66b3b8eefe",
                                "type": "RELATION",
                                "name": "company",
                                "label": "Company",
                                "description": "NoteTarget company",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "1670824b-e097-4afc-8401-feab7f9af0d4",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dcb774a3-71e8-44cc-bf53-7f195e0bfdb6",
                                        "nameSingular": "noteTarget",
                                        "namePlural": "noteTargets"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5a0243d0-051b-4f30-b0d2-da66b3b8eefe",
                                        "name": "company"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "74bf3aba-450e-48f9-987a-60662929e768",
                                        "name": "noteTargets"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "1670824b-e097-4afc-8401-feab7f9af0d4",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "74bf3aba-450e-48f9-987a-60662929e768",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "company",
                                        "namePlural": "companies",
                                        "isSystem": false,
                                        "isRemote": false
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
                "id": "d2834e90-eecc-4528-bab3-ad005effd6f2",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "a13f7bf6-02ab-4f9b-bd3a-c84a56e7ed49",
                "imageIdentifierFieldMetadataId": null,
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
                                "id": "83cb4332-1363-4228-ab85-7a3d2c4922d1",
                                "type": "DATE_TIME",
                                "name": "externalUpdatedAt",
                                "label": "Update DateTime",
                                "description": "Update DateTime",
                                "icon": "IconCalendarCog",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "dde2d1d3-5a7d-4cf3-a982-4f7aff2dfb37",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "c8013b48-cc15-4f19-8141-325a12e771e3",
                                "type": "BOOLEAN",
                                "name": "isFullDay",
                                "label": "Is Full Day",
                                "description": "Is Full Day",
                                "icon": "Icon24Hours",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": false,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "771aa870-f4e7-4fa6-b2e4-52c41cf3d5fc",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "fe7dcb62-099f-4ad1-af7e-a74713f6159d",
                                "type": "RELATION",
                                "name": "calendarChannelEventAssociations",
                                "label": "Calendar Channel Event Associations",
                                "description": "Calendar Channel Event Associations",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "0f9d244b-e9c6-44af-88f4-9ce798d50bf8",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "d2834e90-eecc-4528-bab3-ad005effd6f2",
                                        "nameSingular": "calendarEvent",
                                        "namePlural": "calendarEvents"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "fe7dcb62-099f-4ad1-af7e-a74713f6159d",
                                        "name": "calendarChannelEventAssociations"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4fed9657-e68b-4856-8e6d-a1c860d16242",
                                        "nameSingular": "calendarChannelEventAssociation",
                                        "namePlural": "calendarChannelEventAssociations"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "18cea1c1-f521-4c41-b694-729756931795",
                                        "name": "calendarEvent"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "0f9d244b-e9c6-44af-88f4-9ce798d50bf8",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "18cea1c1-f521-4c41-b694-729756931795",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4fed9657-e68b-4856-8e6d-a1c860d16242",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "calendarChannelEventAssociation",
                                        "namePlural": "calendarChannelEventAssociations",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "74820be8-b911-440a-b7bd-622b3c0fb2f0",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "d8ca199f-72ce-4a48-9e29-133a05520b0f",
                                "type": "TEXT",
                                "name": "location",
                                "label": "Location",
                                "description": "Location",
                                "icon": "IconMapPin",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "a4688389-8263-4209-b72c-a6004d7f0804",
                                "type": "LINKS",
                                "name": "conferenceLink",
                                "label": "Meet Link",
                                "description": "Meet Link",
                                "icon": "IconLink",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": {
                                    "primaryLinkUrl": "''",
                                    "secondaryLinks": null,
                                    "primaryLinkLabel": "''"
                                },
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "6d195419-c615-4b2f-be73-74481a270851",
                                "type": "DATE_TIME",
                                "name": "endsAt",
                                "label": "End Date",
                                "description": "End Date",
                                "icon": "IconCalendarClock",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "a13f7bf6-02ab-4f9b-bd3a-c84a56e7ed49",
                                "type": "TEXT",
                                "name": "title",
                                "label": "Title",
                                "description": "Title",
                                "icon": "IconH1",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "eb3a27fb-9cb8-4017-b896-e52eaf801dc2",
                                "type": "RELATION",
                                "name": "calendarEventParticipants",
                                "label": "Event Participants",
                                "description": "Event Participants",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "e02ea7b1-1d5a-481b-ab71-3c94ab3f9bf0",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "d2834e90-eecc-4528-bab3-ad005effd6f2",
                                        "nameSingular": "calendarEvent",
                                        "namePlural": "calendarEvents"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "eb3a27fb-9cb8-4017-b896-e52eaf801dc2",
                                        "name": "calendarEventParticipants"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "53743ffb-932c-43ec-b624-f5119ec46808",
                                        "nameSingular": "calendarEventParticipant",
                                        "namePlural": "calendarEventParticipants"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "b04775e2-53a3-4f62-a2ab-858f2a456fa7",
                                        "name": "calendarEvent"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "e02ea7b1-1d5a-481b-ab71-3c94ab3f9bf0",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "b04775e2-53a3-4f62-a2ab-858f2a456fa7",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "53743ffb-932c-43ec-b624-f5119ec46808",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "calendarEventParticipant",
                                        "namePlural": "calendarEventParticipants",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "39d10ace-420f-4053-9d68-1111d3b8f39c",
                                "type": "TEXT",
                                "name": "description",
                                "label": "Description",
                                "description": "Description",
                                "icon": "IconFileDescription",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "39534ddd-1942-48ff-a2dc-c0365920bf73",
                                "type": "DATE_TIME",
                                "name": "startsAt",
                                "label": "Start Date",
                                "description": "Start Date",
                                "icon": "IconCalendarClock",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "f3ed1238-8ccf-45e9-8feb-996c3052e57f",
                                "type": "BOOLEAN",
                                "name": "isCanceled",
                                "label": "Is canceled",
                                "description": "Is canceled",
                                "icon": "IconCalendarCancel",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": false,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "f6723e97-b9a7-48d7-960c-291e105190fd",
                                "type": "DATE_TIME",
                                "name": "externalCreatedAt",
                                "label": "Creation DateTime",
                                "description": "Creation DateTime",
                                "icon": "IconCalendarPlus",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "2f6c8e0f-dd7b-4f0b-8e5d-1205720b280b",
                                "type": "TEXT",
                                "name": "iCalUID",
                                "label": "iCal UID",
                                "description": "iCal UID",
                                "icon": "IconKey",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "f7fddaf8-600c-4ff2-8538-19cc56582764",
                                "type": "TEXT",
                                "name": "conferenceSolution",
                                "label": "Conference Solution",
                                "description": "Conference Solution",
                                "icon": "IconScreenShare",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "b6595570-eb50-47db-a823-832bf384ae25",
                                "type": "TEXT",
                                "name": "recurringEventExternalId",
                                "label": "Recurring Event ID",
                                "description": "Recurring Event ID",
                                "icon": "IconHistory",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "ccb2a7ce-f998-4363-b951-cdf7409b64dc",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "850587c2-97aa-42b0-a1f0-e87a1ad98f8c",
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
                                "id": "2ea84bb0-d37a-4b30-a562-5b1124f9090d",
                                "type": "UUID",
                                "name": "recordId",
                                "label": "Record id",
                                "description": "Record id",
                                "icon": "IconAbc",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "8cc90681-a560-4af8-8a68-695c21b981b1",
                                "type": "TEXT",
                                "name": "objectName",
                                "label": "Object name",
                                "description": "Object name",
                                "icon": "IconAbc",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "7eda7a7a-c335-429e-b9ac-8009b94c43c1",
                                "type": "RAW_JSON",
                                "name": "properties",
                                "label": "Event details",
                                "description": "Json value for event details",
                                "icon": "IconListDetails",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "1f77c676-5b7e-4105-ad66-f1c3ae12ebbc",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "0fedd2c5-1c9c-4e0a-8687-a8ce4dd88378",
                                "type": "RELATION",
                                "name": "workspaceMember",
                                "label": "Workspace Member",
                                "description": "Event workspace member",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "d74023b4-87a8-44d0-84d8-9b2a85018e4b",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "ccb2a7ce-f998-4363-b951-cdf7409b64dc",
                                        "nameSingular": "auditLog",
                                        "namePlural": "auditLogs"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "0fedd2c5-1c9c-4e0a-8687-a8ce4dd88378",
                                        "name": "workspaceMember"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "82057d3c-fd1d-4479-a8e3-f18dd9207f3e",
                                        "name": "auditLogs"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "d74023b4-87a8-44d0-84d8-9b2a85018e4b",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "82057d3c-fd1d-4479-a8e3-f18dd9207f3e",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "bda06197-eea9-4fdd-a9b5-101fb473ba00",
                                "type": "RAW_JSON",
                                "name": "context",
                                "label": "Event context",
                                "description": "Json object to provide context (user, device, workspace, etc.)",
                                "icon": "IconListDetails",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "850587c2-97aa-42b0-a1f0-e87a1ad98f8c",
                                "type": "TEXT",
                                "name": "name",
                                "label": "Event name",
                                "description": "Event name/type",
                                "icon": "IconAbc",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "7ff2c10b-db27-44e5-bcaa-8ca3a68e7dae",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "cb33c71d-a957-4c29-b9ea-b6eed8ae8eeb",
                                "type": "UUID",
                                "name": "workspaceMemberId",
                                "label": "Workspace Member id (foreign key)",
                                "description": "Event workspace member id foreign key",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "737e4617-4310-4b6d-af50-bb4fb79a10b7",
                                "type": "TEXT",
                                "name": "objectMetadataId",
                                "label": "Object metadata id",
                                "description": "Object metadata id",
                                "icon": "IconAbc",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "f9aadda1-e30c-4eea-908a-3cea6e5f41cc",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "c81903be-3be2-49af-82b3-d170cd35ac0f",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "98225cd7-c93e-4f1f-ab9a-36a8b56fbdc9",
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
                                "id": "ccf2d3bc-3859-4075-ab3f-4022294f2e30",
                                "type": "BOOLEAN",
                                "name": "isVisible",
                                "label": "Visible",
                                "description": "View Field visibility",
                                "icon": "IconEye",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": true,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "98225cd7-c93e-4f1f-ab9a-36a8b56fbdc9",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "3c5e5a35-731d-4c06-934a-d52bb02bc715",
                                "type": "NUMBER",
                                "name": "size",
                                "label": "Size",
                                "description": "View Field size",
                                "icon": "IconEye",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": 0,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "337d9389-06a9-4cb1-9f2a-76dbb37a7576",
                                "type": "RELATION",
                                "name": "view",
                                "label": "View",
                                "description": "View Field related view",
                                "icon": "IconLayoutCollage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "ae731975-39ee-4387-a80c-de94dff0b760",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c81903be-3be2-49af-82b3-d170cd35ac0f",
                                        "nameSingular": "viewField",
                                        "namePlural": "viewFields"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "337d9389-06a9-4cb1-9f2a-76dbb37a7576",
                                        "name": "view"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2c6e4a32-28cd-4a72-8ca6-915fd819ed32",
                                        "nameSingular": "view",
                                        "namePlural": "views"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "c086b30a-0267-4857-9fe0-29a2bbaa8dc8",
                                        "name": "viewFields"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "ae731975-39ee-4387-a80c-de94dff0b760",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "c086b30a-0267-4857-9fe0-29a2bbaa8dc8",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2c6e4a32-28cd-4a72-8ca6-915fd819ed32",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "view",
                                        "namePlural": "views",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "aafd0a60-9abc-464c-a601-0f4b93643df0",
                                "type": "NUMBER",
                                "name": "position",
                                "label": "Position",
                                "description": "View Field position",
                                "icon": "IconList",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": 0,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "48b3cbca-7061-4431-b671-f517178a6fa6",
                                "type": "UUID",
                                "name": "viewId",
                                "label": "View id (foreign key)",
                                "description": "View Field related view id foreign key",
                                "icon": "IconLayoutCollage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "fd19a167-b702-4fe4-b59d-b0bf5b288ccf",
                                "type": "UUID",
                                "name": "fieldMetadataId",
                                "label": "Field Metadata Id",
                                "description": "View Field target field",
                                "icon": "IconTag",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "31ca8ba9-4d75-4b61-ba76-a879e0f230b6",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "ba35303a-1451-47fe-8900-80262b90d4c6",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "c6d8d5a8-08ab-4828-8b19-82a9a835685a",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "468e8108-653e-4c9e-ba50-bff7937d89ad",
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
                                "id": "7c664574-0bcb-4833-aee1-5a95bad64fbb",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "5e0574cf-4695-48f4-aa29-5b755b33102a",
                                "type": "TEXT",
                                "name": "body",
                                "label": "Body",
                                "description": "Comment body",
                                "icon": "IconLink",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "a7bc8581-749a-49cf-bf04-3b7bdc0b3f4e",
                                "type": "UUID",
                                "name": "authorId",
                                "label": "Author id (foreign key)",
                                "description": "Comment author id foreign key",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "2dd9dd34-4b7a-4082-b983-3e5faf37e60c",
                                "type": "UUID",
                                "name": "activityId",
                                "label": "Activity id (foreign key)",
                                "description": "Comment activity id foreign key",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "ace0311d-6b58-4c34-9e78-3c18ff147408",
                                "type": "RELATION",
                                "name": "activity",
                                "label": "Activity",
                                "description": "Comment activity",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "eaf90876-fac7-448a-906c-7c2b6afcd346",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c6d8d5a8-08ab-4828-8b19-82a9a835685a",
                                        "nameSingular": "comment",
                                        "namePlural": "comments"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "ace0311d-6b58-4c34-9e78-3c18ff147408",
                                        "name": "activity"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "96bf92fd-6b8f-40b4-afd6-f90fedc40a1a",
                                        "nameSingular": "activity",
                                        "namePlural": "activities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "c2a21675-a29d-442a-9f02-84cd93df15ce",
                                        "name": "comments"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "eaf90876-fac7-448a-906c-7c2b6afcd346",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "c2a21675-a29d-442a-9f02-84cd93df15ce",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "96bf92fd-6b8f-40b4-afd6-f90fedc40a1a",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "activity",
                                        "namePlural": "activities",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "468e8108-653e-4c9e-ba50-bff7937d89ad",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "fd9fcac5-c853-4fe7-ab1e-18081e4d4517",
                                "type": "RELATION",
                                "name": "author",
                                "label": "Author",
                                "description": "Comment author",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "017b3808-bc03-4817-8a67-b20770a6a126",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c6d8d5a8-08ab-4828-8b19-82a9a835685a",
                                        "nameSingular": "comment",
                                        "namePlural": "comments"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "fd9fcac5-c853-4fe7-ab1e-18081e4d4517",
                                        "name": "author"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "c86049ea-6cac-4b7f-a58e-b68b917e4a2b",
                                        "name": "authoredComments"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "017b3808-bc03-4817-8a67-b20770a6a126",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "c86049ea-6cac-4b7f-a58e-b68b917e4a2b",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "52a840a8-0d1c-4fdb-bea8-b008c9d3986d",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "b329059f-4b80-4d92-9a2a-4f6373cd8003",
                "imageIdentifierFieldMetadataId": null,
                "fields": {
                    "__typename": "ObjectFieldsConnection",
                    "pageInfo": {
                        "__typename": "PageInfo",
                        "hasNextPage": false,
                        "hasPreviousPage": false,
                        "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                        "endCursor": "YXJyYXljb25uZWN0aW9uOjI0"
                    },
                    "edges": [
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "6062715e-08e8-4ff5-962d-eed4f992fc61",
                                "type": "RELATION",
                                "name": "calendarEventParticipants",
                                "label": "Calendar Event Participants",
                                "description": "Calendar Event Participants",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "d5ffcbba-0ab9-4f4d-a5e6-15f1e668b04c",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "6062715e-08e8-4ff5-962d-eed4f992fc61",
                                        "name": "calendarEventParticipants"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "53743ffb-932c-43ec-b624-f5119ec46808",
                                        "nameSingular": "calendarEventParticipant",
                                        "namePlural": "calendarEventParticipants"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "fbc9d8eb-c04f-4c86-81ff-d4ca9957d0d4",
                                        "name": "workspaceMember"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "d5ffcbba-0ab9-4f4d-a5e6-15f1e668b04c",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "fbc9d8eb-c04f-4c86-81ff-d4ca9957d0d4",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "53743ffb-932c-43ec-b624-f5119ec46808",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "calendarEventParticipant",
                                        "namePlural": "calendarEventParticipants",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "8d0cc1c9-ab4a-406c-b35b-1a1b40fd025c",
                                "type": "TEXT",
                                "name": "locale",
                                "label": "Language",
                                "description": "Preferred language",
                                "icon": "IconLanguage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "'en'",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "ace8a324-075e-49a3-92fa-34e07590ec72",
                                "type": "RELATION",
                                "name": "timelineActivities",
                                "label": "Events",
                                "description": "Events linked to the workspace member",
                                "icon": "IconTimelineEvent",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "5b2015dd-3fac-4118-adf5-3cceede873eb",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "ace8a324-075e-49a3-92fa-34e07590ec72",
                                        "name": "timelineActivities"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e095e196-08d4-493c-8a02-01c4a3decb5c",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "9fc19fe9-2563-41ac-8c92-2062ff3a0c0c",
                                        "name": "workspaceMember"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "5b2015dd-3fac-4118-adf5-3cceede873eb",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "9fc19fe9-2563-41ac-8c92-2062ff3a0c0c",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e095e196-08d4-493c-8a02-01c4a3decb5c",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "57d6eb4f-c86b-4a50-98ce-fa04c849b1a2",
                                "type": "RELATION",
                                "name": "accountOwnerForCompanies",
                                "label": "Account Owner For Companies",
                                "description": "Account owner for companies",
                                "icon": "IconBriefcase",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "97b97e1e-aed0-4d59-997c-13ad9007e037",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "57d6eb4f-c86b-4a50-98ce-fa04c849b1a2",
                                        "name": "accountOwnerForCompanies"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "a56f365a-22c8-475d-816b-709f3a19c5fd",
                                        "name": "accountOwner"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "97b97e1e-aed0-4d59-997c-13ad9007e037",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "a56f365a-22c8-475d-816b-709f3a19c5fd",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "company",
                                        "namePlural": "companies",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "4e4050e5-e6fb-4466-b02b-6d12714373b7",
                                "type": "TEXT",
                                "name": "avatarUrl",
                                "label": "Avatar Url",
                                "description": "Workspace member avatar",
                                "icon": "IconFileUpload",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "2e1b13a4-9ced-4b9d-b9f6-ca274410a933",
                                "type": "UUID",
                                "name": "userId",
                                "label": "User Id",
                                "description": "Associated User Id",
                                "icon": "IconCircleUsers",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "b329059f-4b80-4d92-9a2a-4f6373cd8003",
                                "type": "FULL_NAME",
                                "name": "name",
                                "label": "Name",
                                "description": "Workspace member name",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": {
                                    "lastName": "''",
                                    "firstName": "''"
                                },
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "867aef01-e708-4f56-96b2-11237093a8e6",
                                "type": "TEXT",
                                "name": "userEmail",
                                "label": "User Email",
                                "description": "Related user email address",
                                "icon": "IconMail",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "f9d4a27e-1728-44d8-b990-e648d838a35a",
                                "type": "RELATION",
                                "name": "authoredActivities",
                                "label": "Authored activities",
                                "description": "Activities created by the workspace member",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "fccbbaf8-c653-4e09-8d3e-5652b37d8209",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "f9d4a27e-1728-44d8-b990-e648d838a35a",
                                        "name": "authoredActivities"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "96bf92fd-6b8f-40b4-afd6-f90fedc40a1a",
                                        "nameSingular": "activity",
                                        "namePlural": "activities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "b31f4c53-a5ee-4939-9804-6964144540ca",
                                        "name": "author"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "fccbbaf8-c653-4e09-8d3e-5652b37d8209",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "b31f4c53-a5ee-4939-9804-6964144540ca",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "96bf92fd-6b8f-40b4-afd6-f90fedc40a1a",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "activity",
                                        "namePlural": "activities",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "c6b1b4a1-bad8-4872-b408-aa0ceb668215",
                                "type": "RELATION",
                                "name": "blocklist",
                                "label": "Blocklist",
                                "description": "Blocklisted handles",
                                "icon": "IconForbid2",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "19b7520c-bc6e-490c-bfab-a3b020315cc4",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "c6b1b4a1-bad8-4872-b408-aa0ceb668215",
                                        "name": "blocklist"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "60637cd3-24f6-4d9a-9432-a590accbefb9",
                                        "nameSingular": "blocklist",
                                        "namePlural": "blocklists"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "96acdd2a-b7d1-452b-9e58-5c4265691444",
                                        "name": "workspaceMember"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "19b7520c-bc6e-490c-bfab-a3b020315cc4",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "96acdd2a-b7d1-452b-9e58-5c4265691444",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "60637cd3-24f6-4d9a-9432-a590accbefb9",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "blocklist",
                                        "namePlural": "blocklists",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "328d9621-d8aa-4e2d-91c1-e03c621d79a1",
                                "type": "SELECT",
                                "name": "timeFormat",
                                "label": "Time format",
                                "description": "User's preferred time format",
                                "icon": "IconClock2",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "'SYSTEM'",
                                "options": [
                                    {
                                        "id": "2ea77a47-9b23-4159-bda8-97bf23a52f61",
                                        "color": "sky",
                                        "label": "System",
                                        "value": "SYSTEM",
                                        "position": 0
                                    },
                                    {
                                        "id": "3dc8e58f-c987-4078-b980-d5e2127968e8",
                                        "color": "red",
                                        "label": "24HRS",
                                        "value": "HOUR_24",
                                        "position": 1
                                    },
                                    {
                                        "id": "7d24f928-a955-4419-9081-51117eb181e6",
                                        "color": "purple",
                                        "label": "12HRS",
                                        "value": "HOUR_12",
                                        "position": 2
                                    }
                                ],
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "c00ccd93-ebc7-4744-8cb3-797a752b4627",
                                "type": "RELATION",
                                "name": "messageParticipants",
                                "label": "Message Participants",
                                "description": "Message Participants",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "7d3faf56-e4bb-45ec-9b75-612ca6e9ae5a",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "c00ccd93-ebc7-4744-8cb3-797a752b4627",
                                        "name": "messageParticipants"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0c0a3db9-f3ba-485a-8dff-488c477f3fa6",
                                        "nameSingular": "messageParticipant",
                                        "namePlural": "messageParticipants"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "bc788a8f-8eb2-47bf-a02c-42f7de197ca8",
                                        "name": "workspaceMember"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "7d3faf56-e4bb-45ec-9b75-612ca6e9ae5a",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "bc788a8f-8eb2-47bf-a02c-42f7de197ca8",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0c0a3db9-f3ba-485a-8dff-488c477f3fa6",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "messageParticipant",
                                        "namePlural": "messageParticipants",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "2fa32c75-6169-449b-bfc2-e1576d5ce5fe",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "e2234264-8612-4d1d-bfa8-929cc63bf6fd",
                                "type": "SELECT",
                                "name": "dateFormat",
                                "label": "Date format",
                                "description": "User's preferred date format",
                                "icon": "IconCalendarEvent",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "'SYSTEM'",
                                "options": [
                                    {
                                        "id": "c0053f9a-eaa7-44d2-9c0e-73d95715d007",
                                        "color": "turquoise",
                                        "label": "System",
                                        "value": "SYSTEM",
                                        "position": 0
                                    },
                                    {
                                        "id": "aacbf232-6f01-48dd-9328-6da7ebea0986",
                                        "color": "red",
                                        "label": "Month First",
                                        "value": "MONTH_FIRST",
                                        "position": 1
                                    },
                                    {
                                        "id": "a2b08c2c-7bf4-4730-a4f9-30d122dc5a4b",
                                        "color": "purple",
                                        "label": "Day First",
                                        "value": "DAY_FIRST",
                                        "position": 2
                                    },
                                    {
                                        "id": "29de9f62-1eb7-4808-a63e-53d3dc764c9e",
                                        "color": "sky",
                                        "label": "Year First",
                                        "value": "YEAR_FIRST",
                                        "position": 3
                                    }
                                ],
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "e4c25d9f-10cf-4c33-8c39-7aaac0a98f11",
                                "type": "RELATION",
                                "name": "assignedTasks",
                                "label": "Assigned tasks",
                                "description": "Tasks assigned to the workspace member",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "8cb075f2-e51c-4684-80f6-cf6af471e82a",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "e4c25d9f-10cf-4c33-8c39-7aaac0a98f11",
                                        "name": "assignedTasks"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4601f72c-580d-4e64-8004-4864f5e60da7",
                                        "nameSingular": "task",
                                        "namePlural": "tasks"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5bcc7e50-73ce-4146-b000-5a336f0e9c40",
                                        "name": "assignee"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "8cb075f2-e51c-4684-80f6-cf6af471e82a",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "5bcc7e50-73ce-4146-b000-5a336f0e9c40",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4601f72c-580d-4e64-8004-4864f5e60da7",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "task",
                                        "namePlural": "tasks",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "2d52a31f-3ad8-4d57-90eb-61142bf58382",
                                "type": "RELATION",
                                "name": "assignedActivities",
                                "label": "Assigned activities",
                                "description": "Activities assigned to the workspace member",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "d5315a70-980f-4c45-9a4f-74779a00fdd3",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "2d52a31f-3ad8-4d57-90eb-61142bf58382",
                                        "name": "assignedActivities"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "96bf92fd-6b8f-40b4-afd6-f90fedc40a1a",
                                        "nameSingular": "activity",
                                        "namePlural": "activities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "4ec37c9c-be4c-4f52-a441-03a1dfd951db",
                                        "name": "assignee"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "d5315a70-980f-4c45-9a4f-74779a00fdd3",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "4ec37c9c-be4c-4f52-a441-03a1dfd951db",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "96bf92fd-6b8f-40b4-afd6-f90fedc40a1a",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "activity",
                                        "namePlural": "activities",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "e2cdfd71-1c3e-4793-a95d-91df4a3bbe8d",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "104209de-5259-4d74-b14a-f37badf49be9",
                                "type": "RELATION",
                                "name": "connectedAccounts",
                                "label": "Connected accounts",
                                "description": "Connected accounts",
                                "icon": "IconAt",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "1ecacc04-e834-421d-bf1b-c765e55a4318",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "104209de-5259-4d74-b14a-f37badf49be9",
                                        "name": "connectedAccounts"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "66cd3a29-e2d8-4efa-8852-d17d7b538efa",
                                        "nameSingular": "connectedAccount",
                                        "namePlural": "connectedAccounts"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "95bd59b8-8083-4c76-b770-ec40a744138c",
                                        "name": "accountOwner"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "1ecacc04-e834-421d-bf1b-c765e55a4318",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "95bd59b8-8083-4c76-b770-ec40a744138c",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "66cd3a29-e2d8-4efa-8852-d17d7b538efa",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "connectedAccount",
                                        "namePlural": "connectedAccounts",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "29055851-94dc-4fa9-84d8-295a3d161724",
                                "type": "RELATION",
                                "name": "favorites",
                                "label": "Favorites",
                                "description": "Favorites linked to the workspace member",
                                "icon": "IconHeart",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "a72edc8d-e5e3-4eae-9fd6-4cb0792b18aa",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "29055851-94dc-4fa9-84d8-295a3d161724",
                                        "name": "favorites"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4566e731-1922-4610-8e85-0beab7fc57be",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "0aaf9f83-9b43-4f15-a187-9c11761b367a",
                                        "name": "workspaceMember"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "a72edc8d-e5e3-4eae-9fd6-4cb0792b18aa",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "0aaf9f83-9b43-4f15-a187-9c11761b367a",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4566e731-1922-4610-8e85-0beab7fc57be",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "c86049ea-6cac-4b7f-a58e-b68b917e4a2b",
                                "type": "RELATION",
                                "name": "authoredComments",
                                "label": "Authored comments",
                                "description": "Authored comments",
                                "icon": "IconComment",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "017b3808-bc03-4817-8a67-b20770a6a126",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "c86049ea-6cac-4b7f-a58e-b68b917e4a2b",
                                        "name": "authoredComments"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c6d8d5a8-08ab-4828-8b19-82a9a835685a",
                                        "nameSingular": "comment",
                                        "namePlural": "comments"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "fd9fcac5-c853-4fe7-ab1e-18081e4d4517",
                                        "name": "author"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "017b3808-bc03-4817-8a67-b20770a6a126",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "fd9fcac5-c853-4fe7-ab1e-18081e4d4517",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c6d8d5a8-08ab-4828-8b19-82a9a835685a",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "comment",
                                        "namePlural": "comments",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "fa2a9e43-03f2-4919-b67d-4b62f5c16758",
                                "type": "TEXT",
                                "name": "colorScheme",
                                "label": "Color Scheme",
                                "description": "Preferred color scheme",
                                "icon": "IconColorSwatch",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "'Light'",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "82057d3c-fd1d-4479-a8e3-f18dd9207f3e",
                                "type": "RELATION",
                                "name": "auditLogs",
                                "label": "Audit Logs",
                                "description": "Audit Logs linked to the workspace member",
                                "icon": "IconTimelineEvent",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "d74023b4-87a8-44d0-84d8-9b2a85018e4b",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "82057d3c-fd1d-4479-a8e3-f18dd9207f3e",
                                        "name": "auditLogs"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "ccb2a7ce-f998-4363-b951-cdf7409b64dc",
                                        "nameSingular": "auditLog",
                                        "namePlural": "auditLogs"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "0fedd2c5-1c9c-4e0a-8687-a8ce4dd88378",
                                        "name": "workspaceMember"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "d74023b4-87a8-44d0-84d8-9b2a85018e4b",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "0fedd2c5-1c9c-4e0a-8687-a8ce4dd88378",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "ccb2a7ce-f998-4363-b951-cdf7409b64dc",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "auditLog",
                                        "namePlural": "auditLogs",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "c784bb11-cd83-4392-a14b-4b9028ac4280",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "6e622089-670a-4831-964c-f27af03f39c0",
                                "type": "RELATION",
                                "name": "authoredAttachments",
                                "label": "Authored attachments",
                                "description": "Attachments created by the workspace member",
                                "icon": "IconFileImport",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "5b9f08b0-8960-40c4-b6bb-9d3552a24f8d",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "6e622089-670a-4831-964c-f27af03f39c0",
                                        "name": "authoredAttachments"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "963747ea-45e2-4deb-b36d-73b014e17c42",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "85046974-8ab2-456d-a732-64da14715643",
                                        "name": "author"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "5b9f08b0-8960-40c4-b6bb-9d3552a24f8d",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "85046974-8ab2-456d-a732-64da14715643",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "963747ea-45e2-4deb-b36d-73b014e17c42",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "43ae7fcb-4e9c-4f67-a9cd-8fe5b2c3991b",
                                "type": "TEXT",
                                "name": "timeZone",
                                "label": "Time zone",
                                "description": "User time zone",
                                "icon": "IconTimezone",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "'system'",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "e1eb21dc-7a5e-41e5-99be-8889a3d5ca15",
                "imageIdentifierFieldMetadataId": null,
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
                                "id": "130dedfb-f30c-4a70-b2ca-a70e2aa8c291",
                                "type": "TEXT",
                                "name": "jobTitle",
                                "label": "Job Title",
                                "description": "Contact’s job title",
                                "icon": "IconBriefcase",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "75210cae-eb24-4932-8f00-ccbce38a3d66",
                                "type": "ACTOR",
                                "name": "createdBy",
                                "label": "Created by",
                                "description": "The creator of the record",
                                "icon": "IconCreativeCommonsSa",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": {
                                    "name": "''",
                                    "source": "'MANUAL'"
                                },
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "608e9b7c-8d7a-409c-88c8-455b72b1bbca",
                                "type": "TEXT",
                                "name": "avatarUrl",
                                "label": "Avatar",
                                "description": "Contact’s avatar",
                                "icon": "IconFileUpload",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "2748b607-0fbb-42c8-b79f-695921bcb8ed",
                                "type": "LINKS",
                                "name": "xLink",
                                "label": "X",
                                "description": "Contact’s X/Twitter account",
                                "icon": "IconBrandX",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": {
                                    "primaryLinkUrl": "''",
                                    "secondaryLinks": null,
                                    "primaryLinkLabel": "''"
                                },
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "ee5347ee-390c-42de-bde5-ebaffd2ad0e5",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "5fbb29e4-4ee6-4122-b1c3-1a632e2501ef",
                                "type": "LINKS",
                                "name": "linkedinLink",
                                "label": "Linkedin",
                                "description": "Contact’s Linkedin account",
                                "icon": "IconBrandLinkedin",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": {
                                    "primaryLinkUrl": "''",
                                    "secondaryLinks": null,
                                    "primaryLinkLabel": "''"
                                },
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "a420a3c3-f245-4ab4-9094-bb4cfb7edc9b",
                                "type": "TEXT",
                                "name": "city",
                                "label": "City",
                                "description": "Contact’s city",
                                "icon": "IconMap",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "19f77ace-4b00-4fac-ba7d-8c7a3dde409b",
                                "type": "RELATION",
                                "name": "messageParticipants",
                                "label": "Message Participants",
                                "description": "Message Participants",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "5bb99199-6a3c-4947-b16b-6a90c6097eac",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "19f77ace-4b00-4fac-ba7d-8c7a3dde409b",
                                        "name": "messageParticipants"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0c0a3db9-f3ba-485a-8dff-488c477f3fa6",
                                        "nameSingular": "messageParticipant",
                                        "namePlural": "messageParticipants"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "362195e4-4dfb-49e1-b25b-fe3ffe7b7f14",
                                        "name": "person"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "5bb99199-6a3c-4947-b16b-6a90c6097eac",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "362195e4-4dfb-49e1-b25b-fe3ffe7b7f14",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0c0a3db9-f3ba-485a-8dff-488c477f3fa6",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "messageParticipant",
                                        "namePlural": "messageParticipants",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "e1eb21dc-7a5e-41e5-99be-8889a3d5ca15",
                                "type": "FULL_NAME",
                                "name": "name",
                                "label": "Name",
                                "description": "Contact’s name",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": {
                                    "lastName": "''",
                                    "firstName": "''"
                                },
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "3700e772-3bf6-4150-b5ce-f7f00ded863a",
                                "type": "RELATION",
                                "name": "timelineActivities",
                                "label": "Events",
                                "description": "Events linked to the person",
                                "icon": "IconTimelineEvent",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "680351ba-8759-405d-8fda-90799bf75741",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "3700e772-3bf6-4150-b5ce-f7f00ded863a",
                                        "name": "timelineActivities"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e095e196-08d4-493c-8a02-01c4a3decb5c",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "0669197c-bc4e-4a44-9cd9-db449bfa380e",
                                        "name": "person"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "680351ba-8759-405d-8fda-90799bf75741",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "0669197c-bc4e-4a44-9cd9-db449bfa380e",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e095e196-08d4-493c-8a02-01c4a3decb5c",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "d9594064-5e84-4981-a0f8-0d047322f1e9",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "05863c2c-bcf7-4d88-b0cd-f00335b6854d",
                                "type": "RELATION",
                                "name": "pointOfContactForOpportunities",
                                "label": "POC for Opportunities",
                                "description": "Point of Contact for Opportunities",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "58a081ed-e5e7-44f8-bae6-99be66b6ac2f",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "05863c2c-bcf7-4d88-b0cd-f00335b6854d",
                                        "name": "pointOfContactForOpportunities"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "18ea34ae-f9bc-4240-b65f-46f0d688135f",
                                        "name": "pointOfContact"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "58a081ed-e5e7-44f8-bae6-99be66b6ac2f",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "18ea34ae-f9bc-4240-b65f-46f0d688135f",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "cb89d529-55f2-4757-8248-6939aa038363",
                                "type": "EMAIL",
                                "name": "email",
                                "label": "Email",
                                "description": "Contact’s Email",
                                "icon": "IconMail",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "ee426b52-f4d3-4b96-a7fc-04d968b66331",
                                "type": "RELATION",
                                "name": "favorites",
                                "label": "Favorites",
                                "description": "Favorites linked to the contact",
                                "icon": "IconHeart",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "74f62324-bc36-4210-bb88-e0e6e0136c9f",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "ee426b52-f4d3-4b96-a7fc-04d968b66331",
                                        "name": "favorites"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4566e731-1922-4610-8e85-0beab7fc57be",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "4a9e3e27-70b0-4ed7-9edf-9126c1675b22",
                                        "name": "person"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "74f62324-bc36-4210-bb88-e0e6e0136c9f",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "4a9e3e27-70b0-4ed7-9edf-9126c1675b22",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4566e731-1922-4610-8e85-0beab7fc57be",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "c87e6f64-f722-4487-9930-1c6fb67572c1",
                                "type": "RELATION",
                                "name": "activityTargets",
                                "label": "Activities",
                                "description": "Activities tied to the contact",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "450a3266-7706-4593-a458-5897c5f60fc5",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "c87e6f64-f722-4487-9930-1c6fb67572c1",
                                        "name": "activityTargets"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "948a52f8-eba6-4bb2-a3a7-b1aa61c0daf7",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "f0748d0d-e6b4-44ea-b957-0c0d81af4627",
                                        "name": "person"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "450a3266-7706-4593-a458-5897c5f60fc5",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "f0748d0d-e6b4-44ea-b957-0c0d81af4627",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "948a52f8-eba6-4bb2-a3a7-b1aa61c0daf7",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "fe7c56ff-5531-4abc-a10a-048b01034596",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "538e49cd-f04a-4889-9994-35cacc0754b7",
                                "type": "RELATION",
                                "name": "company",
                                "label": "Company",
                                "description": "Contact’s company",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "2f030298-14c7-48a4-b351-2ec185bb1814",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "538e49cd-f04a-4889-9994-35cacc0754b7",
                                        "name": "company"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "0943b1b4-3aae-4ebe-8e8e-b1a8640d78d9",
                                        "name": "people"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "2f030298-14c7-48a4-b351-2ec185bb1814",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "0943b1b4-3aae-4ebe-8e8e-b1a8640d78d9",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "company",
                                        "namePlural": "companies",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "aa9f1d0c-ef2c-4bec-849f-aaf3b83a6c3c",
                                "type": "UUID",
                                "name": "companyId",
                                "label": "Company id (foreign key)",
                                "description": "Contact’s company id foreign key",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "fd48c551-1309-473d-bb7e-921c577b731b",
                                "type": "RELATION",
                                "name": "calendarEventParticipants",
                                "label": "Calendar Event Participants",
                                "description": "Calendar Event Participants",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "178c5cfe-cc05-49ec-bedb-eff402da4e8f",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "fd48c551-1309-473d-bb7e-921c577b731b",
                                        "name": "calendarEventParticipants"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "53743ffb-932c-43ec-b624-f5119ec46808",
                                        "nameSingular": "calendarEventParticipant",
                                        "namePlural": "calendarEventParticipants"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "a2ecf99f-9725-4b20-90df-28ad410f173b",
                                        "name": "person"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "178c5cfe-cc05-49ec-bedb-eff402da4e8f",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "a2ecf99f-9725-4b20-90df-28ad410f173b",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "53743ffb-932c-43ec-b624-f5119ec46808",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "calendarEventParticipant",
                                        "namePlural": "calendarEventParticipants",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "d7df3544-94ed-439f-94de-86ad7828669a",
                                "type": "TEXT",
                                "name": "phone",
                                "label": "Phone",
                                "description": "Contact’s phone number",
                                "icon": "IconPhone",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "82d1a637-3df9-4d59-a412-1cbc1d92baf2",
                                "type": "RELATION",
                                "name": "noteTargets",
                                "label": "Notes",
                                "description": "Notes tied to the contact",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "700c5e52-3e7b-4471-9826-82270c03c37e",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "82d1a637-3df9-4d59-a412-1cbc1d92baf2",
                                        "name": "noteTargets"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dcb774a3-71e8-44cc-bf53-7f195e0bfdb6",
                                        "nameSingular": "noteTarget",
                                        "namePlural": "noteTargets"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "8ac4df39-f1a0-4221-a605-bd4c229fbc12",
                                        "name": "person"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "700c5e52-3e7b-4471-9826-82270c03c37e",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "8ac4df39-f1a0-4221-a605-bd4c229fbc12",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dcb774a3-71e8-44cc-bf53-7f195e0bfdb6",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "noteTarget",
                                        "namePlural": "noteTargets",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "5030bb60-7366-4e7d-8ba4-35c6a6255547",
                                "type": "RELATION",
                                "name": "attachments",
                                "label": "Attachments",
                                "description": "Attachments linked to the contact.",
                                "icon": "IconFileImport",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "0c8f43c1-d325-4a58-99a7-926b1db4e8fc",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5030bb60-7366-4e7d-8ba4-35c6a6255547",
                                        "name": "attachments"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "963747ea-45e2-4deb-b36d-73b014e17c42",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "b192eb71-bcfb-46ab-ae88-83a73700ee34",
                                        "name": "person"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "0c8f43c1-d325-4a58-99a7-926b1db4e8fc",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "b192eb71-bcfb-46ab-ae88-83a73700ee34",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "963747ea-45e2-4deb-b36d-73b014e17c42",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "a53d5e8d-85d9-45de-9f45-d8b4f5b11c3a",
                                "type": "RELATION",
                                "name": "taskTargets",
                                "label": "Tasks",
                                "description": "Tasks tied to the contact",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "e95da71a-7162-4282-8ff7-ea65fea36fe8",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "a53d5e8d-85d9-45de-9f45-d8b4f5b11c3a",
                                        "name": "taskTargets"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "5e92b318-bc10-4fe3-b997-de41b7e45c36",
                                        "nameSingular": "taskTarget",
                                        "namePlural": "taskTargets"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "db61f1e6-17d5-4f1d-8c18-8cb5f1108831",
                                        "name": "person"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "e95da71a-7162-4282-8ff7-ea65fea36fe8",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "db61f1e6-17d5-4f1d-8c18-8cb5f1108831",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "5e92b318-bc10-4fe3-b997-de41b7e45c36",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "taskTarget",
                                        "namePlural": "taskTargets",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "148421f0-84b0-4af0-bc54-17a116242b14",
                                "type": "POSITION",
                                "name": "position",
                                "label": "Position",
                                "description": "Person record Position",
                                "icon": "IconHierarchy2",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "aeb6b83d-3545-4d48-8281-0d46258a3447",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "d9c16cc2-6a42-4ea8-a6be-08f6d9571c14",
                "imageIdentifierFieldMetadataId": null,
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
                                "id": "d9c16cc2-6a42-4ea8-a6be-08f6d9571c14",
                                "type": "TEXT",
                                "name": "name",
                                "label": "Name",
                                "description": "ApiKey name",
                                "icon": "IconLink",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "ac04da17-5ffc-4027-9124-4af02c307d23",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "3b213998-ade1-4836-a42f-1dc9b476f8f3",
                                "type": "DATE_TIME",
                                "name": "expiresAt",
                                "label": "Expiration date",
                                "description": "ApiKey expiration date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "a3a6cbc2-f8dd-4ed0-8648-065253f9183e",
                                "type": "DATE_TIME",
                                "name": "revokedAt",
                                "label": "Revocation date",
                                "description": "ApiKey revocation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "15091a7f-64c4-4011-91b0-a63ed1f298ec",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "3003e27d-9fc7-417b-a388-062144884d76",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "96bf92fd-6b8f-40b4-afd6-f90fedc40a1a",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "c0608084-ab8e-4527-8a27-81f12f43550a",
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
                                "id": "c0608084-ab8e-4527-8a27-81f12f43550a",
                                "type": "TEXT",
                                "name": "title",
                                "label": "Title",
                                "description": "Activity title",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "b478ec3c-46d5-46b1-9a55-0938c0a7213d",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "5d7fa454-c89c-4fdd-ac48-6b119977c8bd",
                                "type": "RELATION",
                                "name": "attachments",
                                "label": "Attachments",
                                "description": "Activity attachments",
                                "icon": "IconFileImport",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "69539f96-cede-4f76-bd64-84b1182c3427",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "96bf92fd-6b8f-40b4-afd6-f90fedc40a1a",
                                        "nameSingular": "activity",
                                        "namePlural": "activities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5d7fa454-c89c-4fdd-ac48-6b119977c8bd",
                                        "name": "attachments"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "963747ea-45e2-4deb-b36d-73b014e17c42",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "a6299818-986d-4358-9a7b-04e6f5e0fd8b",
                                        "name": "activity"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "69539f96-cede-4f76-bd64-84b1182c3427",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "a6299818-986d-4358-9a7b-04e6f5e0fd8b",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "963747ea-45e2-4deb-b36d-73b014e17c42",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "15c8c04b-1d3c-4d40-b405-bfce8d1c46ad",
                                "type": "UUID",
                                "name": "authorId",
                                "label": "Author id (foreign key)",
                                "description": "Activity author id foreign key",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "fdf929a7-5529-4be3-a7df-aa08d2a23b2c",
                                "type": "RELATION",
                                "name": "activityTargets",
                                "label": "Targets",
                                "description": "Activity targets",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "938c0b4f-e398-4db6-8893-ad6b609556a9",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "96bf92fd-6b8f-40b4-afd6-f90fedc40a1a",
                                        "nameSingular": "activity",
                                        "namePlural": "activities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "fdf929a7-5529-4be3-a7df-aa08d2a23b2c",
                                        "name": "activityTargets"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "948a52f8-eba6-4bb2-a3a7-b1aa61c0daf7",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "8bcf99e6-2368-4caa-9c5e-e70c46bc6ab7",
                                        "name": "activity"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "938c0b4f-e398-4db6-8893-ad6b609556a9",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "8bcf99e6-2368-4caa-9c5e-e70c46bc6ab7",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "948a52f8-eba6-4bb2-a3a7-b1aa61c0daf7",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "0cbf9212-7130-4a59-9752-c29b00b0e6fd",
                                "type": "TEXT",
                                "name": "type",
                                "label": "Type",
                                "description": "Activity type",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "'Note'",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "c2a21675-a29d-442a-9f02-84cd93df15ce",
                                "type": "RELATION",
                                "name": "comments",
                                "label": "Comments",
                                "description": "Activity comments",
                                "icon": "IconComment",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "eaf90876-fac7-448a-906c-7c2b6afcd346",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "96bf92fd-6b8f-40b4-afd6-f90fedc40a1a",
                                        "nameSingular": "activity",
                                        "namePlural": "activities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "c2a21675-a29d-442a-9f02-84cd93df15ce",
                                        "name": "comments"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c6d8d5a8-08ab-4828-8b19-82a9a835685a",
                                        "nameSingular": "comment",
                                        "namePlural": "comments"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "ace0311d-6b58-4c34-9e78-3c18ff147408",
                                        "name": "activity"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "eaf90876-fac7-448a-906c-7c2b6afcd346",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "ace0311d-6b58-4c34-9e78-3c18ff147408",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c6d8d5a8-08ab-4828-8b19-82a9a835685a",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "comment",
                                        "namePlural": "comments",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "b31f4c53-a5ee-4939-9804-6964144540ca",
                                "type": "RELATION",
                                "name": "author",
                                "label": "Author",
                                "description": "Activity author",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "fccbbaf8-c653-4e09-8d3e-5652b37d8209",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "96bf92fd-6b8f-40b4-afd6-f90fedc40a1a",
                                        "nameSingular": "activity",
                                        "namePlural": "activities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "b31f4c53-a5ee-4939-9804-6964144540ca",
                                        "name": "author"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "f9d4a27e-1728-44d8-b990-e648d838a35a",
                                        "name": "authoredActivities"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "fccbbaf8-c653-4e09-8d3e-5652b37d8209",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "f9d4a27e-1728-44d8-b990-e648d838a35a",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "4ec37c9c-be4c-4f52-a441-03a1dfd951db",
                                "type": "RELATION",
                                "name": "assignee",
                                "label": "Assignee",
                                "description": "Activity assignee",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "d5315a70-980f-4c45-9a4f-74779a00fdd3",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "96bf92fd-6b8f-40b4-afd6-f90fedc40a1a",
                                        "nameSingular": "activity",
                                        "namePlural": "activities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "4ec37c9c-be4c-4f52-a441-03a1dfd951db",
                                        "name": "assignee"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "2d52a31f-3ad8-4d57-90eb-61142bf58382",
                                        "name": "assignedActivities"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "d5315a70-980f-4c45-9a4f-74779a00fdd3",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "2d52a31f-3ad8-4d57-90eb-61142bf58382",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "e3010b50-0dce-4ca7-8fc6-580601f03a6a",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "bd9cb34e-4225-469b-8703-2948ff2a7503",
                                "type": "TEXT",
                                "name": "body",
                                "label": "Body",
                                "description": "Activity body",
                                "icon": "IconList",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "ba97c4a5-7141-4a70-8963-f36e24c8ab09",
                                "type": "DATE_TIME",
                                "name": "completedAt",
                                "label": "Completion Date",
                                "description": "Activity completion date",
                                "icon": "IconCheck",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "eddc4e8e-0664-4e28-a46d-87d39efe8b82",
                                "type": "DATE_TIME",
                                "name": "reminderAt",
                                "label": "Reminder Date",
                                "description": "Activity reminder date",
                                "icon": "IconCalendarEvent",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "845efc95-6c7c-4292-a4df-b9d1d159f6b9",
                                "type": "UUID",
                                "name": "assigneeId",
                                "label": "Assignee id (foreign key)",
                                "description": "Activity assignee id foreign key",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "e50e247e-3db5-468a-802d-04d02b7b0331",
                                "type": "DATE_TIME",
                                "name": "dueAt",
                                "label": "Due Date",
                                "description": "Activity due date",
                                "icon": "IconCalendarEvent",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "2a0b35ca-c76e-494f-a03a-c9e9844d2696",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "963747ea-45e2-4deb-b36d-73b014e17c42",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "9d4f5164-457e-4e78-bacd-8633e234153b",
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
                                "id": "f4c14cf5-f007-4e2b-a7b5-f5a77c7c5492",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "0913c9cc-c3d4-4fd4-9fc7-b758daa08ba4",
                                "type": "RELATION",
                                "name": "task",
                                "label": "Task",
                                "description": "Attachment task",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "cc228da1-14c7-4c49-a84d-231ba6166f38",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "963747ea-45e2-4deb-b36d-73b014e17c42",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "0913c9cc-c3d4-4fd4-9fc7-b758daa08ba4",
                                        "name": "task"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4601f72c-580d-4e64-8004-4864f5e60da7",
                                        "nameSingular": "task",
                                        "namePlural": "tasks"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "7c3b7305-e7be-4dbf-9e94-ee354e011f63",
                                        "name": "attachments"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "cc228da1-14c7-4c49-a84d-231ba6166f38",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "7c3b7305-e7be-4dbf-9e94-ee354e011f63",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4601f72c-580d-4e64-8004-4864f5e60da7",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "task",
                                        "namePlural": "tasks",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "36f7236a-bfd2-404c-adb6-66b294ca5435",
                                "type": "RELATION",
                                "name": "company",
                                "label": "Company",
                                "description": "Attachment company",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "2be99c6b-02c8-4ca0-b155-dcf7539097b5",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "963747ea-45e2-4deb-b36d-73b014e17c42",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "36f7236a-bfd2-404c-adb6-66b294ca5435",
                                        "name": "company"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "16706d44-4042-4998-b5c7-15437e052196",
                                        "name": "attachments"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "2be99c6b-02c8-4ca0-b155-dcf7539097b5",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "16706d44-4042-4998-b5c7-15437e052196",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "company",
                                        "namePlural": "companies",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "b192eb71-bcfb-46ab-ae88-83a73700ee34",
                                "type": "RELATION",
                                "name": "person",
                                "label": "Person",
                                "description": "Attachment person",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "0c8f43c1-d325-4a58-99a7-926b1db4e8fc",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "963747ea-45e2-4deb-b36d-73b014e17c42",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "b192eb71-bcfb-46ab-ae88-83a73700ee34",
                                        "name": "person"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5030bb60-7366-4e7d-8ba4-35c6a6255547",
                                        "name": "attachments"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "0c8f43c1-d325-4a58-99a7-926b1db4e8fc",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "5030bb60-7366-4e7d-8ba4-35c6a6255547",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "person",
                                        "namePlural": "people",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "a6299818-986d-4358-9a7b-04e6f5e0fd8b",
                                "type": "RELATION",
                                "name": "activity",
                                "label": "Activity",
                                "description": "Attachment activity",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "69539f96-cede-4f76-bd64-84b1182c3427",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "963747ea-45e2-4deb-b36d-73b014e17c42",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "a6299818-986d-4358-9a7b-04e6f5e0fd8b",
                                        "name": "activity"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "96bf92fd-6b8f-40b4-afd6-f90fedc40a1a",
                                        "nameSingular": "activity",
                                        "namePlural": "activities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5d7fa454-c89c-4fdd-ac48-6b119977c8bd",
                                        "name": "attachments"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "69539f96-cede-4f76-bd64-84b1182c3427",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "5d7fa454-c89c-4fdd-ac48-6b119977c8bd",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "96bf92fd-6b8f-40b4-afd6-f90fedc40a1a",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "activity",
                                        "namePlural": "activities",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "1d2daa92-3e60-4d45-b3f5-2cdaea3171c8",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "9d9f7585-6229-49ec-8657-a0f16608aa18",
                                "type": "UUID",
                                "name": "personId",
                                "label": "Person id (foreign key)",
                                "description": "Attachment person id foreign key",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "bbde9d64-838e-4eea-b947-81fa6f44c76a",
                                "type": "UUID",
                                "name": "authorId",
                                "label": "Author id (foreign key)",
                                "description": "Attachment author id foreign key",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "f8a0a4ad-a6f5-4eb3-985d-a3134e5449ad",
                                "type": "RELATION",
                                "name": "note",
                                "label": "Note",
                                "description": "Attachment note",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "bb4120f5-5135-4881-97a8-d50e6df2f97e",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "963747ea-45e2-4deb-b36d-73b014e17c42",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "f8a0a4ad-a6f5-4eb3-985d-a3134e5449ad",
                                        "name": "note"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4cd6194a-093e-4c5d-9ff2-218970b01e3c",
                                        "nameSingular": "note",
                                        "namePlural": "notes"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "2a2fa9e4-242f-449e-a191-d1937ee4cedc",
                                        "name": "attachments"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "bb4120f5-5135-4881-97a8-d50e6df2f97e",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "2a2fa9e4-242f-449e-a191-d1937ee4cedc",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4cd6194a-093e-4c5d-9ff2-218970b01e3c",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "note",
                                        "namePlural": "notes",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "9d4f5164-457e-4e78-bacd-8633e234153b",
                                "type": "TEXT",
                                "name": "name",
                                "label": "Name",
                                "description": "Attachment name",
                                "icon": "IconFileUpload",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "9a3bd188-009f-4790-8f11-7978d420ebad",
                                "type": "UUID",
                                "name": "noteId",
                                "label": "Note id (foreign key)",
                                "description": "Attachment note id foreign key",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "dd866825-21ca-4f0b-86e5-9bff38a9daa0",
                                "type": "TEXT",
                                "name": "type",
                                "label": "Type",
                                "description": "Attachment type",
                                "icon": "IconList",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "855ffc2d-08c3-42e1-bd5a-c8a11fced7dc",
                                "type": "TEXT",
                                "name": "fullPath",
                                "label": "Full path",
                                "description": "Attachment full path",
                                "icon": "IconLink",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "b16667c6-6f37-4010-871d-219f840a5b50",
                                "type": "UUID",
                                "name": "companyId",
                                "label": "Company id (foreign key)",
                                "description": "Attachment company id foreign key",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "f9a294b9-9def-4e4d-8f2b-8db82b65606c",
                                "type": "UUID",
                                "name": "opportunityId",
                                "label": "Opportunity id (foreign key)",
                                "description": "Attachment opportunity id foreign key",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "b240e780-8bf4-4193-b4c4-1eaf8cac31f6",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "6d99366d-b55c-4574-a533-709c8a902eef",
                                "type": "UUID",
                                "name": "activityId",
                                "label": "Activity id (foreign key)",
                                "description": "Attachment activity id foreign key",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "85046974-8ab2-456d-a732-64da14715643",
                                "type": "RELATION",
                                "name": "author",
                                "label": "Author",
                                "description": "Attachment author",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "5b9f08b0-8960-40c4-b6bb-9d3552a24f8d",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "963747ea-45e2-4deb-b36d-73b014e17c42",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "85046974-8ab2-456d-a732-64da14715643",
                                        "name": "author"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "6e622089-670a-4831-964c-f27af03f39c0",
                                        "name": "authoredAttachments"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "5b9f08b0-8960-40c4-b6bb-9d3552a24f8d",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "6e622089-670a-4831-964c-f27af03f39c0",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "b4868b15-ff98-4f36-9f59-1dbf63052bb7",
                                "type": "RELATION",
                                "name": "opportunity",
                                "label": "Opportunity",
                                "description": "Attachment opportunity",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "c20ecc99-e48a-4311-b850-8fbf1a7b68ea",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "963747ea-45e2-4deb-b36d-73b014e17c42",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "b4868b15-ff98-4f36-9f59-1dbf63052bb7",
                                        "name": "opportunity"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "095b38a6-1881-40b8-9849-cb80d19aa295",
                                        "name": "attachments"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "c20ecc99-e48a-4311-b850-8fbf1a7b68ea",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "095b38a6-1881-40b8-9849-cb80d19aa295",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "04d74996-9228-47ee-9297-333439d4937e",
                                "type": "UUID",
                                "name": "taskId",
                                "label": "Task id (foreign key)",
                                "description": "Attachment task id foreign key",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "948a52f8-eba6-4bb2-a3a7-b1aa61c0daf7",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "58b83d14-5f42-49c8-9048-485fe0259e7b",
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
                                "id": "06fa978e-2d47-42ad-8652-00ad8e4f8c03",
                                "type": "UUID",
                                "name": "companyId",
                                "label": "Company id (foreign key)",
                                "description": "ActivityTarget company id foreign key",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "8bcf99e6-2368-4caa-9c5e-e70c46bc6ab7",
                                "type": "RELATION",
                                "name": "activity",
                                "label": "Activity",
                                "description": "ActivityTarget activity",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "938c0b4f-e398-4db6-8893-ad6b609556a9",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "948a52f8-eba6-4bb2-a3a7-b1aa61c0daf7",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "8bcf99e6-2368-4caa-9c5e-e70c46bc6ab7",
                                        "name": "activity"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "96bf92fd-6b8f-40b4-afd6-f90fedc40a1a",
                                        "nameSingular": "activity",
                                        "namePlural": "activities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "fdf929a7-5529-4be3-a7df-aa08d2a23b2c",
                                        "name": "activityTargets"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "938c0b4f-e398-4db6-8893-ad6b609556a9",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "fdf929a7-5529-4be3-a7df-aa08d2a23b2c",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "96bf92fd-6b8f-40b4-afd6-f90fedc40a1a",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "activity",
                                        "namePlural": "activities",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "ddc84553-0678-4697-a8c2-06ddbc136cab",
                                "type": "RELATION",
                                "name": "opportunity",
                                "label": "Opportunity",
                                "description": "ActivityTarget opportunity",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "2105fe76-e9fa-4610-992a-261d0f24722d",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "948a52f8-eba6-4bb2-a3a7-b1aa61c0daf7",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "ddc84553-0678-4697-a8c2-06ddbc136cab",
                                        "name": "opportunity"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "1bab9225-7390-43d7-a2c5-1d14f918efc0",
                                        "name": "activityTargets"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "2105fe76-e9fa-4610-992a-261d0f24722d",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "1bab9225-7390-43d7-a2c5-1d14f918efc0",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "242672b2-7f38-4864-8101-b8e2fb4605b0",
                                "type": "UUID",
                                "name": "personId",
                                "label": "Person id (foreign key)",
                                "description": "ActivityTarget person id foreign key",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "9a9a2055-3de4-46ef-a721-edf60be80cee",
                                "type": "UUID",
                                "name": "opportunityId",
                                "label": "Opportunity id (foreign key)",
                                "description": "ActivityTarget opportunity id foreign key",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "f0748d0d-e6b4-44ea-b957-0c0d81af4627",
                                "type": "RELATION",
                                "name": "person",
                                "label": "Person",
                                "description": "ActivityTarget person",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "450a3266-7706-4593-a458-5897c5f60fc5",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "948a52f8-eba6-4bb2-a3a7-b1aa61c0daf7",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "f0748d0d-e6b4-44ea-b957-0c0d81af4627",
                                        "name": "person"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "c87e6f64-f722-4487-9930-1c6fb67572c1",
                                        "name": "activityTargets"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "450a3266-7706-4593-a458-5897c5f60fc5",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "c87e6f64-f722-4487-9930-1c6fb67572c1",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "person",
                                        "namePlural": "people",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "6cf6997c-82cd-41ae-9178-4e02467afe80",
                                "type": "UUID",
                                "name": "activityId",
                                "label": "Activity id (foreign key)",
                                "description": "ActivityTarget activity id foreign key",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "caeac93e-8092-4661-9b61-ba0c8b20d4e7",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "331d70b2-5cec-438f-b535-1ac0e59900bc",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "6213d5af-e8cd-4e5d-9a60-bab631884ae5",
                                "type": "RELATION",
                                "name": "company",
                                "label": "Company",
                                "description": "ActivityTarget company",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "a0f5427c-2c97-4457-b87f-a4d145e06952",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "948a52f8-eba6-4bb2-a3a7-b1aa61c0daf7",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "6213d5af-e8cd-4e5d-9a60-bab631884ae5",
                                        "name": "company"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "33454d9c-57f7-4639-9120-b024f365d52f",
                                        "name": "activityTargets"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "a0f5427c-2c97-4457-b87f-a4d145e06952",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "33454d9c-57f7-4639-9120-b024f365d52f",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "company",
                                        "namePlural": "companies",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "58b83d14-5f42-49c8-9048-485fe0259e7b",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "816a7154-5111-47fa-9d8d-87ca2dafc521",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "dc8df23b-c648-4781-a329-cc921f104396",
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
                                "id": "0fbd44d4-1342-45b9-a688-de8f8b3cfe97",
                                "type": "TEXT",
                                "name": "value",
                                "label": "Value",
                                "description": "View Filter value",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "2ad7121a-e95e-4b14-9d36-387feebaf516",
                                "type": "UUID",
                                "name": "viewId",
                                "label": "View id (foreign key)",
                                "description": "View Filter related view id foreign key",
                                "icon": "IconLayoutCollage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "07eed82c-b376-4cd6-a04a-042fde8d3058",
                                "type": "TEXT",
                                "name": "displayValue",
                                "label": "Display Value",
                                "description": "View Filter Display Value",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "89eaa2a3-6302-46d8-b06d-6640c336c489",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "0f9c4eb8-501d-4861-827a-5ef45a01eba9",
                                "type": "RELATION",
                                "name": "view",
                                "label": "View",
                                "description": "View Filter related view",
                                "icon": "IconLayoutCollage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "7c42db51-2fcc-44b6-9a80-787b1967e69e",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "816a7154-5111-47fa-9d8d-87ca2dafc521",
                                        "nameSingular": "viewFilter",
                                        "namePlural": "viewFilters"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "0f9c4eb8-501d-4861-827a-5ef45a01eba9",
                                        "name": "view"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2c6e4a32-28cd-4a72-8ca6-915fd819ed32",
                                        "nameSingular": "view",
                                        "namePlural": "views"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "4f92f2f0-9204-4f23-afdc-894829664668",
                                        "name": "viewFilters"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "7c42db51-2fcc-44b6-9a80-787b1967e69e",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "4f92f2f0-9204-4f23-afdc-894829664668",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2c6e4a32-28cd-4a72-8ca6-915fd819ed32",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "view",
                                        "namePlural": "views",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "dc8df23b-c648-4781-a329-cc921f104396",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "4f9a929d-5701-4140-b509-8376c8853c2b",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "dfaccfbb-668f-42aa-9e9f-0dfefa4a7e94",
                                "type": "TEXT",
                                "name": "operand",
                                "label": "Operand",
                                "description": "View Filter operand",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "'Contains'",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "169eeb4d-f3e8-46f4-b0a3-7404bc1994cb",
                                "type": "UUID",
                                "name": "fieldMetadataId",
                                "label": "Field Metadata Id",
                                "description": "View Filter target field",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "718779fd-d87d-4b99-8f6c-3042a6bb03a3",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "ef4449f6-3cb3-4538-9b93-4bed0060873e",
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
                                "id": "da9e216d-b9ac-44de-a22f-ae579d76cd44",
                                "type": "TEXT",
                                "name": "direction",
                                "label": "Direction",
                                "description": "View Sort direction",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "'asc'",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "7a4f3e54-7c7d-4fc6-8f12-a4c7f0d0d731",
                                "type": "UUID",
                                "name": "viewId",
                                "label": "View id (foreign key)",
                                "description": "View Sort related view id foreign key",
                                "icon": "IconLayoutCollage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "ef4449f6-3cb3-4538-9b93-4bed0060873e",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "a021c847-07b3-4d3c-af30-b3330ce58e1b",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "11985659-99a1-4f03-9a95-c5d610acc8e9",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "2c09d04d-007c-4652-9c90-c2cfa4696145",
                                "type": "RELATION",
                                "name": "view",
                                "label": "View",
                                "description": "View Sort related view",
                                "icon": "IconLayoutCollage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "fcf27acc-a651-4ac2-9f99-aba306756209",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "718779fd-d87d-4b99-8f6c-3042a6bb03a3",
                                        "nameSingular": "viewSort",
                                        "namePlural": "viewSorts"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "2c09d04d-007c-4652-9c90-c2cfa4696145",
                                        "name": "view"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2c6e4a32-28cd-4a72-8ca6-915fd819ed32",
                                        "nameSingular": "view",
                                        "namePlural": "views"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5969cfdb-bf30-4a34-9b52-11b38945bbd0",
                                        "name": "viewSorts"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "fcf27acc-a651-4ac2-9f99-aba306756209",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "5969cfdb-bf30-4a34-9b52-11b38945bbd0",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2c6e4a32-28cd-4a72-8ca6-915fd819ed32",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "view",
                                        "namePlural": "views",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "46007b88-46a1-4746-a25f-82151f01525e",
                                "type": "UUID",
                                "name": "fieldMetadataId",
                                "label": "Field Metadata Id",
                                "description": "View Sort target field",
                                "icon": "IconTag",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "9e123592-cd2b-471c-8143-3cc0b46089ef",
                "imageIdentifierFieldMetadataId": null,
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
                                "id": "a56f365a-22c8-475d-816b-709f3a19c5fd",
                                "type": "RELATION",
                                "name": "accountOwner",
                                "label": "Account Owner",
                                "description": "Your team member responsible for managing the company account",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "97b97e1e-aed0-4d59-997c-13ad9007e037",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "a56f365a-22c8-475d-816b-709f3a19c5fd",
                                        "name": "accountOwner"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "57d6eb4f-c86b-4a50-98ce-fa04c849b1a2",
                                        "name": "accountOwnerForCompanies"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "97b97e1e-aed0-4d59-997c-13ad9007e037",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "57d6eb4f-c86b-4a50-98ce-fa04c849b1a2",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "6c4a0327-d84f-416a-8491-269a74254437",
                                "type": "BOOLEAN",
                                "name": "idealCustomerProfile",
                                "label": "ICP",
                                "description": "Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you",
                                "icon": "IconTarget",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": false,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "5dcef112-ce1b-46c1-a33a-4d1394628c34",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                                                {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "277d8939-1ead-4cdb-a560-854644219779",
                                "type": "MULTI_SELECT",
                                "name": "testMultiSelect",
                                "label": "Test Multi Select",
                                "description": "Test Multi Select",
                                "icon": "IconSelect",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "f207dd14-f05e-4f29-b222-8993d4680f31",
                                "type": "RAW_JSON",
                                "name": "testRawJson",
                                "label": "Test Raw Json",
                                "description": "Json value for event details",
                                "icon": "IconListDetails",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "81db846a-a2f9-4b31-8931-81fac5cdd1b6",
                                "type": "RATING",
                                "name": "testRating",
                                "label": "Rating",
                                "description": "Rating value",
                                "icon": "IconListDetails",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "b295267e-e066-4eb1-98ab-50a9d3004394",
                                "type": "RELATION",
                                "name": "taskTargets",
                                "label": "Tasks",
                                "description": "Tasks tied to the company",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "ac6788b1-952c-4376-bafd-66ea5a031398",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "b295267e-e066-4eb1-98ab-50a9d3004394",
                                        "name": "taskTargets"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "5e92b318-bc10-4fe3-b997-de41b7e45c36",
                                        "nameSingular": "taskTarget",
                                        "namePlural": "taskTargets"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "d89d8a7f-6a14-4fc8-96ca-2966632a1ca4",
                                        "name": "company"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "ac6788b1-952c-4376-bafd-66ea5a031398",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "d89d8a7f-6a14-4fc8-96ca-2966632a1ca4",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "5e92b318-bc10-4fe3-b997-de41b7e45c36",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "taskTarget",
                                        "namePlural": "taskTargets",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "33454d9c-57f7-4639-9120-b024f365d52f",
                                "type": "RELATION",
                                "name": "activityTargets",
                                "label": "Activities",
                                "description": "Activities tied to the company",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "a0f5427c-2c97-4457-b87f-a4d145e06952",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "33454d9c-57f7-4639-9120-b024f365d52f",
                                        "name": "activityTargets"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "948a52f8-eba6-4bb2-a3a7-b1aa61c0daf7",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "6213d5af-e8cd-4e5d-9a60-bab631884ae5",
                                        "name": "company"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "a0f5427c-2c97-4457-b87f-a4d145e06952",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "6213d5af-e8cd-4e5d-9a60-bab631884ae5",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "948a52f8-eba6-4bb2-a3a7-b1aa61c0daf7",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "531f05f1-2c54-4f41-a569-eaac4d58a4ae",
                                "type": "POSITION",
                                "name": "position",
                                "label": "Position",
                                "description": "Company record position",
                                "icon": "IconHierarchy2",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "b2304609-4b9c-40f9-b1d6-21c0974e636e",
                                "type": "LINKS",
                                "name": "xLink",
                                "label": "X",
                                "description": "The company Twitter/X account",
                                "icon": "IconBrandX",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": {
                                    "primaryLinkUrl": "''",
                                    "secondaryLinks": null,
                                    "primaryLinkLabel": "''"
                                },
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "02a1dce3-e661-48d8-868b-83c6e6e79a35",
                                "type": "LINKS",
                                "name": "domainName",
                                "label": "Domain Name",
                                "description": "The company website URL. We use this url to fetch the company icon",
                                "icon": "IconLink",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": {
                                    "primaryLinkUrl": "''",
                                    "secondaryLinks": null,
                                    "primaryLinkLabel": "''"
                                },
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "81214e8d-e79d-420b-bb2d-8e1f0965b4a6",
                                "type": "UUID",
                                "name": "accountOwnerId",
                                "label": "Account Owner id (foreign key)",
                                "description": "Your team member responsible for managing the company account id foreign key",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "92fa0702-e680-4042-aa65-ddf9721030b4",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "a0df43b7-d926-44a2-ba12-252866607207",
                                "type": "RELATION",
                                "name": "favorites",
                                "label": "Favorites",
                                "description": "Favorites linked to the company",
                                "icon": "IconHeart",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "632aaba8-f213-4353-95a5-c090168c3ad7",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "a0df43b7-d926-44a2-ba12-252866607207",
                                        "name": "favorites"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4566e731-1922-4610-8e85-0beab7fc57be",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "4fa60a42-bd0d-462c-b05d-d85f96b00458",
                                        "name": "company"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "632aaba8-f213-4353-95a5-c090168c3ad7",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "4fa60a42-bd0d-462c-b05d-d85f96b00458",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4566e731-1922-4610-8e85-0beab7fc57be",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "f39f1db9-3d7f-46d3-aa0c-4cae44352407",
                                "type": "RELATION",
                                "name": "timelineActivities",
                                "label": "Timeline Activities",
                                "description": "Timeline Activities linked to the company",
                                "icon": "IconIconTimelineEvent",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "1e93ed03-91a5-4ad4-bca7-c6a637551289",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "f39f1db9-3d7f-46d3-aa0c-4cae44352407",
                                        "name": "timelineActivities"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e095e196-08d4-493c-8a02-01c4a3decb5c",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "0224c08b-2c2e-474f-8360-dafad378cf62",
                                        "name": "company"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "1e93ed03-91a5-4ad4-bca7-c6a637551289",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "0224c08b-2c2e-474f-8360-dafad378cf62",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e095e196-08d4-493c-8a02-01c4a3decb5c",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "1a843af7-219d-460b-9869-b2d89479e42a",
                                "type": "CURRENCY",
                                "name": "annualRecurringRevenue",
                                "label": "ARR",
                                "description": "Annual Recurring Revenue: The actual or estimated annual revenue of the company",
                                "icon": "IconMoneybag",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": {
                                    "amountMicros": null,
                                    "currencyCode": "''"
                                },
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "16706d44-4042-4998-b5c7-15437e052196",
                                "type": "RELATION",
                                "name": "attachments",
                                "label": "Attachments",
                                "description": "Attachments linked to the company",
                                "icon": "IconFileImport",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "2be99c6b-02c8-4ca0-b155-dcf7539097b5",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "16706d44-4042-4998-b5c7-15437e052196",
                                        "name": "attachments"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "963747ea-45e2-4deb-b36d-73b014e17c42",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "36f7236a-bfd2-404c-adb6-66b294ca5435",
                                        "name": "company"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "2be99c6b-02c8-4ca0-b155-dcf7539097b5",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "36f7236a-bfd2-404c-adb6-66b294ca5435",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "963747ea-45e2-4deb-b36d-73b014e17c42",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "9e123592-cd2b-471c-8143-3cc0b46089ef",
                                "type": "TEXT",
                                "name": "name",
                                "label": "Name",
                                "description": "The company name",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "76878ce1-1d00-4e86-8694-58b66bbb5df0",
                                "type": "LINKS",
                                "name": "linkedinLink",
                                "label": "Linkedin",
                                "description": "The company Linkedin account",
                                "icon": "IconBrandLinkedin",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": {
                                    "primaryLinkUrl": "''",
                                    "secondaryLinks": null,
                                    "primaryLinkLabel": "''"
                                },
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "bcaf1d51-a492-48db-ab86-35b8ea496364",
                                "type": "ADDRESS",
                                "name": "address",
                                "label": "Address",
                                "description": "Address of the company",
                                "icon": "IconMap",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
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
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "74bf3aba-450e-48f9-987a-60662929e768",
                                "type": "RELATION",
                                "name": "noteTargets",
                                "label": "Notes",
                                "description": "Notes tied to the company",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "1670824b-e097-4afc-8401-feab7f9af0d4",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "74bf3aba-450e-48f9-987a-60662929e768",
                                        "name": "noteTargets"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dcb774a3-71e8-44cc-bf53-7f195e0bfdb6",
                                        "nameSingular": "noteTarget",
                                        "namePlural": "noteTargets"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5a0243d0-051b-4f30-b0d2-da66b3b8eefe",
                                        "name": "company"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "1670824b-e097-4afc-8401-feab7f9af0d4",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "5a0243d0-051b-4f30-b0d2-da66b3b8eefe",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dcb774a3-71e8-44cc-bf53-7f195e0bfdb6",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "noteTarget",
                                        "namePlural": "noteTargets",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "12a6505b-8d0b-4f02-ba94-742d7cc0ac8d",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "7ecd1240-7300-4e9e-a9d2-02b489e160b9",
                                "type": "ACTOR",
                                "name": "createdBy",
                                "label": "Created by",
                                "description": "The creator of the record",
                                "icon": "IconCreativeCommonsSa",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": {
                                    "name": "''",
                                    "source": "'MANUAL'"
                                },
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "0943b1b4-3aae-4ebe-8e8e-b1a8640d78d9",
                                "type": "RELATION",
                                "name": "people",
                                "label": "People",
                                "description": "People linked to the company.",
                                "icon": "IconUsers",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "2f030298-14c7-48a4-b351-2ec185bb1814",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "0943b1b4-3aae-4ebe-8e8e-b1a8640d78d9",
                                        "name": "people"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "538e49cd-f04a-4889-9994-35cacc0754b7",
                                        "name": "company"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "2f030298-14c7-48a4-b351-2ec185bb1814",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "538e49cd-f04a-4889-9994-35cacc0754b7",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "person",
                                        "namePlural": "people",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "0f4348ce-6621-4af6-b557-f03308a03101",
                                "type": "NUMBER",
                                "name": "employees",
                                "label": "Employees",
                                "description": "Number of employees in the company",
                                "icon": "IconUsers",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "34aec238-a534-46e7-be64-d0680a12c8ec",
                                "type": "RELATION",
                                "name": "opportunities",
                                "label": "Opportunities",
                                "description": "Opportunities linked to the company.",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "1ebadb76-46e6-4c57-b24f-441acecbd2d9",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "34aec238-a534-46e7-be64-d0680a12c8ec",
                                        "name": "opportunities"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "727ec83b-93b7-4e6b-be22-6f00637ec3f5",
                                        "name": "company"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "1ebadb76-46e6-4c57-b24f-441acecbd2d9",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "727ec83b-93b7-4e6b-be22-6f00637ec3f5",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities",
                                        "isSystem": false,
                                        "isRemote": false
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
                "id": "66cd3a29-e2d8-4efa-8852-d17d7b538efa",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "d46591de-57c3-46ae-aca1-3d5cf2e39984",
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
                                "id": "d7c1698d-a73b-45f4-9bb1-b6b0a4f38fdb",
                                "type": "DATE_TIME",
                                "name": "authFailedAt",
                                "label": "Auth failed at",
                                "description": "Auth failed at",
                                "icon": "IconX",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "3bf6ad9c-0441-4b8f-8dd0-12d93f83b67a",
                                "type": "RELATION",
                                "name": "messageChannels",
                                "label": "Message Channels",
                                "description": "Message Channels",
                                "icon": "IconMessage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "21bbef75-8acf-48bf-80aa-1d26d50aea22",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "66cd3a29-e2d8-4efa-8852-d17d7b538efa",
                                        "nameSingular": "connectedAccount",
                                        "namePlural": "connectedAccounts"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "3bf6ad9c-0441-4b8f-8dd0-12d93f83b67a",
                                        "name": "messageChannels"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "311ea123-5b30-4637-ae39-3e639e780c83",
                                        "nameSingular": "messageChannel",
                                        "namePlural": "messageChannels"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "d288fd3a-8fb0-493d-bec3-31a2c4a7d366",
                                        "name": "connectedAccount"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "21bbef75-8acf-48bf-80aa-1d26d50aea22",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "d288fd3a-8fb0-493d-bec3-31a2c4a7d366",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "311ea123-5b30-4637-ae39-3e639e780c83",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "messageChannel",
                                        "namePlural": "messageChannels",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "98853a40-3d9b-42d4-942d-bc08c4d3a520",
                                "type": "TEXT",
                                "name": "provider",
                                "label": "provider",
                                "description": "The account provider",
                                "icon": "IconSettings",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "d46591de-57c3-46ae-aca1-3d5cf2e39984",
                                "type": "TEXT",
                                "name": "handle",
                                "label": "handle",
                                "description": "The account handle (email, username, phone number, etc.)",
                                "icon": "IconMail",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "ac09a2a9-d4ec-4293-b595-e5d684fd776c",
                                "type": "TEXT",
                                "name": "lastSyncHistoryId",
                                "label": "Last sync history ID",
                                "description": "Last sync history ID",
                                "icon": "IconHistory",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "bda628b5-29a7-41fc-8f50-4bc75902adc4",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "c27f1d98-24b4-4776-a49e-ca104eea9aaf",
                                "type": "TEXT",
                                "name": "accessToken",
                                "label": "Access Token",
                                "description": "Messaging provider access token",
                                "icon": "IconKey",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "e2ba34b6-e188-4b2b-bbf9-0625f33154e1",
                                "type": "TEXT",
                                "name": "refreshToken",
                                "label": "Refresh Token",
                                "description": "Messaging provider refresh token",
                                "icon": "IconKey",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "bb10e69d-f049-4d97-84f4-09bce29cd401",
                                "type": "RELATION",
                                "name": "calendarChannels",
                                "label": "Calendar Channels",
                                "description": "Calendar Channels",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "b6b75323-8790-4b3e-8798-e0af646bb9aa",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "66cd3a29-e2d8-4efa-8852-d17d7b538efa",
                                        "nameSingular": "connectedAccount",
                                        "namePlural": "connectedAccounts"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "bb10e69d-f049-4d97-84f4-09bce29cd401",
                                        "name": "calendarChannels"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0e285964-d858-48bc-98ab-b8c6b1bd5d0b",
                                        "nameSingular": "calendarChannel",
                                        "namePlural": "calendarChannels"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "ceaf8f8e-297a-418b-a652-01f3eeb5c562",
                                        "name": "connectedAccount"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "b6b75323-8790-4b3e-8798-e0af646bb9aa",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "ceaf8f8e-297a-418b-a652-01f3eeb5c562",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0e285964-d858-48bc-98ab-b8c6b1bd5d0b",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "calendarChannel",
                                        "namePlural": "calendarChannels",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "48006d4c-0d9c-4099-9ab8-812d0e522faf",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "ebc20c3a-157e-46a0-84c7-b0a4a93ead20",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "15512b35-a65c-4f87-8c98-0b0a1b6f92fe",
                                "type": "UUID",
                                "name": "accountOwnerId",
                                "label": "Account Owner id (foreign key)",
                                "description": "Account Owner id foreign key",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "95bd59b8-8083-4c76-b770-ec40a744138c",
                                "type": "RELATION",
                                "name": "accountOwner",
                                "label": "Account Owner",
                                "description": "Account Owner",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "1ecacc04-e834-421d-bf1b-c765e55a4318",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "66cd3a29-e2d8-4efa-8852-d17d7b538efa",
                                        "nameSingular": "connectedAccount",
                                        "namePlural": "connectedAccounts"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "95bd59b8-8083-4c76-b770-ec40a744138c",
                                        "name": "accountOwner"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "104209de-5259-4d74-b14a-f37badf49be9",
                                        "name": "connectedAccounts"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "1ecacc04-e834-421d-bf1b-c765e55a4318",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "104209de-5259-4d74-b14a-f37badf49be9",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "27048fa7-94eb-4ca0-8479-096a6b990e0f",
                                "type": "TEXT",
                                "name": "handleAliases",
                                "label": "Handle Aliases",
                                "description": "Handle Aliases",
                                "icon": "IconMail",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "60637cd3-24f6-4d9a-9432-a590accbefb9",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "67c4f9b6-f1b6-48d0-a502-71aef617fed2",
                "imageIdentifierFieldMetadataId": null,
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
                                "id": "6d5237ae-e410-4701-ae0c-8d73bf83c49f",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "67c4f9b6-f1b6-48d0-a502-71aef617fed2",
                                "type": "TEXT",
                                "name": "handle",
                                "label": "Handle",
                                "description": "Handle",
                                "icon": "IconAt",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "96acdd2a-b7d1-452b-9e58-5c4265691444",
                                "type": "RELATION",
                                "name": "workspaceMember",
                                "label": "WorkspaceMember",
                                "description": "WorkspaceMember",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "19b7520c-bc6e-490c-bfab-a3b020315cc4",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "60637cd3-24f6-4d9a-9432-a590accbefb9",
                                        "nameSingular": "blocklist",
                                        "namePlural": "blocklists"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "96acdd2a-b7d1-452b-9e58-5c4265691444",
                                        "name": "workspaceMember"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "c6b1b4a1-bad8-4872-b408-aa0ceb668215",
                                        "name": "blocklist"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "19b7520c-bc6e-490c-bfab-a3b020315cc4",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "c6b1b4a1-bad8-4872-b408-aa0ceb668215",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "9b5ffcde-f21d-43c9-9d8c-ff718fe8c4cb",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "616690bd-fdca-483b-9b1d-e85642f770b4",
                                "type": "UUID",
                                "name": "workspaceMemberId",
                                "label": "WorkspaceMember id (foreign key)",
                                "description": "WorkspaceMember id foreign key",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "697ba30c-5088-4af7-b7c4-39249c3df401",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "5e92b318-bc10-4fe3-b997-de41b7e45c36",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "f9109154-65ca-42d5-b21c-1251790f60f8",
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
                                "id": "807cfd9f-4081-4027-b646-cf66d81aa8c6",
                                "type": "RELATION",
                                "name": "opportunity",
                                "label": "Opportunity",
                                "description": "TaskTarget opportunity",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "457627a4-8e4f-4720-80b4-b8c47a49a1d7",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "5e92b318-bc10-4fe3-b997-de41b7e45c36",
                                        "nameSingular": "taskTarget",
                                        "namePlural": "taskTargets"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "807cfd9f-4081-4027-b646-cf66d81aa8c6",
                                        "name": "opportunity"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "100f9c10-11c4-4fee-963a-f98a0e42d05d",
                                        "name": "taskTargets"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "457627a4-8e4f-4720-80b4-b8c47a49a1d7",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "100f9c10-11c4-4fee-963a-f98a0e42d05d",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "db61f1e6-17d5-4f1d-8c18-8cb5f1108831",
                                "type": "RELATION",
                                "name": "person",
                                "label": "Person",
                                "description": "TaskTarget person",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "e95da71a-7162-4282-8ff7-ea65fea36fe8",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "5e92b318-bc10-4fe3-b997-de41b7e45c36",
                                        "nameSingular": "taskTarget",
                                        "namePlural": "taskTargets"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "db61f1e6-17d5-4f1d-8c18-8cb5f1108831",
                                        "name": "person"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "a53d5e8d-85d9-45de-9f45-d8b4f5b11c3a",
                                        "name": "taskTargets"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "e95da71a-7162-4282-8ff7-ea65fea36fe8",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "a53d5e8d-85d9-45de-9f45-d8b4f5b11c3a",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "person",
                                        "namePlural": "people",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "f9109154-65ca-42d5-b21c-1251790f60f8",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "e5958bbf-0743-46a4-9222-cefbaa0bd45f",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "c84f3d16-2914-4861-8097-d4c58aa7e60e",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "03f631d8-6e86-49c0-9197-dab8df407176",
                                "type": "UUID",
                                "name": "personId",
                                "label": "Person id (foreign key)",
                                "description": "TaskTarget person id foreign key",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "0f37463a-4a08-44b6-87b6-8175ffa6bff0",
                                "type": "RELATION",
                                "name": "task",
                                "label": "Task",
                                "description": "TaskTarget task",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "1cc7a6b5-66d2-40dc-aa08-4b1a252e3ae3",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "5e92b318-bc10-4fe3-b997-de41b7e45c36",
                                        "nameSingular": "taskTarget",
                                        "namePlural": "taskTargets"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "0f37463a-4a08-44b6-87b6-8175ffa6bff0",
                                        "name": "task"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4601f72c-580d-4e64-8004-4864f5e60da7",
                                        "nameSingular": "task",
                                        "namePlural": "tasks"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "157bef1e-50c2-4c2a-bc48-a5bc790c0f08",
                                        "name": "taskTargets"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "1cc7a6b5-66d2-40dc-aa08-4b1a252e3ae3",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "157bef1e-50c2-4c2a-bc48-a5bc790c0f08",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4601f72c-580d-4e64-8004-4864f5e60da7",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "task",
                                        "namePlural": "tasks",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "d89d8a7f-6a14-4fc8-96ca-2966632a1ca4",
                                "type": "RELATION",
                                "name": "company",
                                "label": "Company",
                                "description": "TaskTarget company",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "ac6788b1-952c-4376-bafd-66ea5a031398",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "5e92b318-bc10-4fe3-b997-de41b7e45c36",
                                        "nameSingular": "taskTarget",
                                        "namePlural": "taskTargets"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "d89d8a7f-6a14-4fc8-96ca-2966632a1ca4",
                                        "name": "company"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "b295267e-e066-4eb1-98ab-50a9d3004394",
                                        "name": "taskTargets"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "ac6788b1-952c-4376-bafd-66ea5a031398",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "b295267e-e066-4eb1-98ab-50a9d3004394",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "company",
                                        "namePlural": "companies",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "e5c3fbc8-1d4a-4474-a06b-001868038a82",
                                "type": "UUID",
                                "name": "taskId",
                                "label": "Task id (foreign key)",
                                "description": "TaskTarget task id foreign key",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "e387828b-ddb0-4991-86bb-9f37149cf20c",
                                "type": "UUID",
                                "name": "opportunityId",
                                "label": "Opportunity id (foreign key)",
                                "description": "TaskTarget opportunity id foreign key",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "1f6a22b6-d296-43ed-bdeb-1303d334aa8c",
                                "type": "UUID",
                                "name": "companyId",
                                "label": "Company id (foreign key)",
                                "description": "TaskTarget company id foreign key",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "53743ffb-932c-43ec-b624-f5119ec46808",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "a05d5847-6d10-4c04-9c9c-e1b6c239ed0f",
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
                                "id": "f50861f2-6921-4c3a-8218-930fa98dcb36",
                                "type": "UUID",
                                "name": "calendarEventId",
                                "label": "Event ID id (foreign key)",
                                "description": "Event ID id foreign key",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "13af93a8-ad97-477a-992d-be998d44f2f3",
                                "type": "UUID",
                                "name": "workspaceMemberId",
                                "label": "Workspace Member id (foreign key)",
                                "description": "Workspace Member id foreign key",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "3f1d464a-8f3a-42a3-98e3-f314f906d437",
                                "type": "SELECT",
                                "name": "responseStatus",
                                "label": "Response Status",
                                "description": "Response Status",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "'NEEDS_ACTION'",
                                "options": [
                                    {
                                        "id": "83748f1c-0fe1-4b92-929f-1adef17c1041",
                                        "color": "orange",
                                        "label": "Needs Action",
                                        "value": "NEEDS_ACTION",
                                        "position": 0
                                    },
                                    {
                                        "id": "3b770f03-26a4-4b08-9eee-d2e7cf6fe3c9",
                                        "color": "red",
                                        "label": "Declined",
                                        "value": "DECLINED",
                                        "position": 1
                                    },
                                    {
                                        "id": "86b4d0ed-a858-42df-bd9b-31ef0448ef68",
                                        "color": "yellow",
                                        "label": "Tentative",
                                        "value": "TENTATIVE",
                                        "position": 2
                                    },
                                    {
                                        "id": "842f49df-916c-4119-86fe-f6332bf6aef2",
                                        "color": "green",
                                        "label": "Accepted",
                                        "value": "ACCEPTED",
                                        "position": 3
                                    }
                                ],
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "ffaf23b6-1c4c-4073-9c66-2e213764dc86",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "78c18d2c-6316-45f4-983a-17505a4991f2",
                                "type": "BOOLEAN",
                                "name": "isOrganizer",
                                "label": "Is Organizer",
                                "description": "Is Organizer",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": false,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "a2ecf99f-9725-4b20-90df-28ad410f173b",
                                "type": "RELATION",
                                "name": "person",
                                "label": "Person",
                                "description": "Person",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "178c5cfe-cc05-49ec-bedb-eff402da4e8f",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "53743ffb-932c-43ec-b624-f5119ec46808",
                                        "nameSingular": "calendarEventParticipant",
                                        "namePlural": "calendarEventParticipants"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "a2ecf99f-9725-4b20-90df-28ad410f173b",
                                        "name": "person"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "fd48c551-1309-473d-bb7e-921c577b731b",
                                        "name": "calendarEventParticipants"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "178c5cfe-cc05-49ec-bedb-eff402da4e8f",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "fd48c551-1309-473d-bb7e-921c577b731b",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "person",
                                        "namePlural": "people",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "4071dc84-8e86-4174-92c8-d201cbe00587",
                                "type": "TEXT",
                                "name": "displayName",
                                "label": "Display Name",
                                "description": "Display Name",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "07dcc4ef-0f27-4fd3-bfaf-0f931dfaba97",
                                "type": "UUID",
                                "name": "personId",
                                "label": "Person id (foreign key)",
                                "description": "Person id foreign key",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "b04775e2-53a3-4f62-a2ab-858f2a456fa7",
                                "type": "RELATION",
                                "name": "calendarEvent",
                                "label": "Event ID",
                                "description": "Event ID",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "e02ea7b1-1d5a-481b-ab71-3c94ab3f9bf0",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "53743ffb-932c-43ec-b624-f5119ec46808",
                                        "nameSingular": "calendarEventParticipant",
                                        "namePlural": "calendarEventParticipants"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "b04775e2-53a3-4f62-a2ab-858f2a456fa7",
                                        "name": "calendarEvent"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "d2834e90-eecc-4528-bab3-ad005effd6f2",
                                        "nameSingular": "calendarEvent",
                                        "namePlural": "calendarEvents"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "eb3a27fb-9cb8-4017-b896-e52eaf801dc2",
                                        "name": "calendarEventParticipants"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "e02ea7b1-1d5a-481b-ab71-3c94ab3f9bf0",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "eb3a27fb-9cb8-4017-b896-e52eaf801dc2",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "d2834e90-eecc-4528-bab3-ad005effd6f2",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "calendarEvent",
                                        "namePlural": "calendarEvents",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "fbc9d8eb-c04f-4c86-81ff-d4ca9957d0d4",
                                "type": "RELATION",
                                "name": "workspaceMember",
                                "label": "Workspace Member",
                                "description": "Workspace Member",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "d5ffcbba-0ab9-4f4d-a5e6-15f1e668b04c",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "53743ffb-932c-43ec-b624-f5119ec46808",
                                        "nameSingular": "calendarEventParticipant",
                                        "namePlural": "calendarEventParticipants"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "fbc9d8eb-c04f-4c86-81ff-d4ca9957d0d4",
                                        "name": "workspaceMember"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "6062715e-08e8-4ff5-962d-eed4f992fc61",
                                        "name": "calendarEventParticipants"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "d5ffcbba-0ab9-4f4d-a5e6-15f1e668b04c",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "6062715e-08e8-4ff5-962d-eed4f992fc61",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "cdb9b9ba-ac5c-4806-a017-8ca8b250fc50",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "0178d7b0-59e1-48d2-bc62-4138e6d28b60",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "a05d5847-6d10-4c04-9c9c-e1b6c239ed0f",
                                "type": "TEXT",
                                "name": "handle",
                                "label": "Handle",
                                "description": "Handle",
                                "icon": "IconMail",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "4fed9657-e68b-4856-8e6d-a1c860d16242",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "277a098a-129a-4c86-b467-6738edc923e6",
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
                                "id": "3ff32421-dddd-49d6-bce2-51517a50e621",
                                "type": "TEXT",
                                "name": "eventExternalId",
                                "label": "Event external ID",
                                "description": "Event external ID",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "cae3d473-1e5b-4963-a88d-8fd2ef8090dc",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "18cea1c1-f521-4c41-b694-729756931795",
                                "type": "RELATION",
                                "name": "calendarEvent",
                                "label": "Event ID",
                                "description": "Event ID",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "0f9d244b-e9c6-44af-88f4-9ce798d50bf8",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4fed9657-e68b-4856-8e6d-a1c860d16242",
                                        "nameSingular": "calendarChannelEventAssociation",
                                        "namePlural": "calendarChannelEventAssociations"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "18cea1c1-f521-4c41-b694-729756931795",
                                        "name": "calendarEvent"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "d2834e90-eecc-4528-bab3-ad005effd6f2",
                                        "nameSingular": "calendarEvent",
                                        "namePlural": "calendarEvents"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "fe7dcb62-099f-4ad1-af7e-a74713f6159d",
                                        "name": "calendarChannelEventAssociations"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "0f9d244b-e9c6-44af-88f4-9ce798d50bf8",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "fe7dcb62-099f-4ad1-af7e-a74713f6159d",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "d2834e90-eecc-4528-bab3-ad005effd6f2",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "calendarEvent",
                                        "namePlural": "calendarEvents",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "4ddb8993-4601-4743-b042-8dab9784a405",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "277a098a-129a-4c86-b467-6738edc923e6",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "567e7a03-352b-4ba6-9fd8-c173a72d8465",
                                "type": "UUID",
                                "name": "calendarChannelId",
                                "label": "Channel ID id (foreign key)",
                                "description": "Channel ID id foreign key",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "d3039865-07b4-4114-bd78-18aa0be2a93b",
                                "type": "RELATION",
                                "name": "calendarChannel",
                                "label": "Channel ID",
                                "description": "Channel ID",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "bf0f695a-08cd-4767-9a83-4fd09f617793",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4fed9657-e68b-4856-8e6d-a1c860d16242",
                                        "nameSingular": "calendarChannelEventAssociation",
                                        "namePlural": "calendarChannelEventAssociations"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "d3039865-07b4-4114-bd78-18aa0be2a93b",
                                        "name": "calendarChannel"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0e285964-d858-48bc-98ab-b8c6b1bd5d0b",
                                        "nameSingular": "calendarChannel",
                                        "namePlural": "calendarChannels"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "9867ad34-df58-4ad0-a459-cc283990b5e5",
                                        "name": "calendarChannelEventAssociations"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "bf0f695a-08cd-4767-9a83-4fd09f617793",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "9867ad34-df58-4ad0-a459-cc283990b5e5",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0e285964-d858-48bc-98ab-b8c6b1bd5d0b",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "calendarChannel",
                                        "namePlural": "calendarChannels",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "461f9bbb-92b0-4070-a7d2-7f029bae5cff",
                                "type": "UUID",
                                "name": "calendarEventId",
                                "label": "Event ID id (foreign key)",
                                "description": "Event ID id foreign key",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "4cd6194a-093e-4c5d-9ff2-218970b01e3c",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "e031b434-6370-484a-a88e-c9c526abde5d",
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
                                "id": "2b3caa88-203b-460c-be49-88db3b45e18d",
                                "type": "POSITION",
                                "name": "position",
                                "label": "Position",
                                "description": "Note record position",
                                "icon": "IconHierarchy2",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "b66379fc-ac94-4823-b759-aa940fde9c73",
                                "type": "RELATION",
                                "name": "timelineActivities",
                                "label": "Timeline Activities",
                                "description": "Timeline Activities linked to the note.",
                                "icon": "IconTimelineEvent",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "7ec36219-a377-4aea-98be-7954590f8a32",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4cd6194a-093e-4c5d-9ff2-218970b01e3c",
                                        "nameSingular": "note",
                                        "namePlural": "notes"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "b66379fc-ac94-4823-b759-aa940fde9c73",
                                        "name": "timelineActivities"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e095e196-08d4-493c-8a02-01c4a3decb5c",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "bc0e2a25-4e13-4751-a79a-2d264582ef9a",
                                        "name": "note"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "7ec36219-a377-4aea-98be-7954590f8a32",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "bc0e2a25-4e13-4751-a79a-2d264582ef9a",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e095e196-08d4-493c-8a02-01c4a3decb5c",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "04794a4e-35c3-46a9-8bf3-8ba1c0324f0b",
                                "type": "RELATION",
                                "name": "noteTargets",
                                "label": "Targets",
                                "description": "Note targets",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "663e9842-8b92-451a-bf73-12a886ff8b05",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4cd6194a-093e-4c5d-9ff2-218970b01e3c",
                                        "nameSingular": "note",
                                        "namePlural": "notes"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "04794a4e-35c3-46a9-8bf3-8ba1c0324f0b",
                                        "name": "noteTargets"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dcb774a3-71e8-44cc-bf53-7f195e0bfdb6",
                                        "nameSingular": "noteTarget",
                                        "namePlural": "noteTargets"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "87334d50-0c5d-4327-a8c5-3db6bc28c1ea",
                                        "name": "note"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "663e9842-8b92-451a-bf73-12a886ff8b05",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "87334d50-0c5d-4327-a8c5-3db6bc28c1ea",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dcb774a3-71e8-44cc-bf53-7f195e0bfdb6",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "noteTarget",
                                        "namePlural": "noteTargets",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "2a2fa9e4-242f-449e-a191-d1937ee4cedc",
                                "type": "RELATION",
                                "name": "attachments",
                                "label": "Attachments",
                                "description": "Note attachments",
                                "icon": "IconFileImport",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "bb4120f5-5135-4881-97a8-d50e6df2f97e",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4cd6194a-093e-4c5d-9ff2-218970b01e3c",
                                        "nameSingular": "note",
                                        "namePlural": "notes"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "2a2fa9e4-242f-449e-a191-d1937ee4cedc",
                                        "name": "attachments"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "963747ea-45e2-4deb-b36d-73b014e17c42",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "f8a0a4ad-a6f5-4eb3-985d-a3134e5449ad",
                                        "name": "note"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "bb4120f5-5135-4881-97a8-d50e6df2f97e",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "f8a0a4ad-a6f5-4eb3-985d-a3134e5449ad",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "963747ea-45e2-4deb-b36d-73b014e17c42",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "e031b434-6370-484a-a88e-c9c526abde5d",
                                "type": "TEXT",
                                "name": "title",
                                "label": "Title",
                                "description": "Note title",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "0c70e522-0571-4fca-8e4e-11c856819aeb",
                                "type": "RICH_TEXT",
                                "name": "body",
                                "label": "Body",
                                "description": "Note body",
                                "icon": "IconFilePencil",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "71958224-6de5-4998-82fc-8e85a3b247d6",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "0121cd64-663f-4856-b9fc-97973a7e5ee5",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "6de21035-5574-471c-80d9-4fb72375ff30",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "0d8481f5-5c58-4604-9283-7a5780eab671",
                                "type": "ACTOR",
                                "name": "createdBy",
                                "label": "Created by",
                                "description": "The creator of the record",
                                "icon": "IconCreativeCommonsSa",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": {
                                    "name": "''",
                                    "source": "'MANUAL'"
                                },
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "4601f72c-580d-4e64-8004-4864f5e60da7",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "d55d2259-62d5-4738-ab6c-07a7293ccb1d",
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
                                "id": "54f90efb-a0f4-4adb-9752-58593520ba14",
                                "type": "ACTOR",
                                "name": "createdBy",
                                "label": "Created by",
                                "description": "The creator of the record",
                                "icon": "IconCreativeCommonsSa",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": {
                                    "name": "''",
                                    "source": "'MANUAL'"
                                },
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "671afe20-9fe1-41f7-9ea1-37a41b3f14ea",
                                "type": "SELECT",
                                "name": "status",
                                "label": "Status",
                                "description": "Task status",
                                "icon": "IconCheck",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "'TODO'",
                                "options": [
                                    {
                                        "id": "dedd046f-fc42-4f12-b791-0eb51ca8fa87",
                                        "color": "sky",
                                        "label": "To do",
                                        "value": "TODO",
                                        "position": 0
                                    },
                                    {
                                        "id": "849a02b8-c8d4-4249-9b18-4f44a226b8a1",
                                        "color": "purple",
                                        "label": "In progress",
                                        "value": "IN_PROGESS",
                                        "position": 1
                                    },
                                    {
                                        "id": "ff6527b5-06af-4e84-808f-bd8148525341",
                                        "color": "green",
                                        "label": "Done",
                                        "value": "DONE",
                                        "position": 1
                                    }
                                ],
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "975e6a19-d90c-45dc-9bb0-ffc57f4e1950",
                                "type": "RELATION",
                                "name": "timelineActivities",
                                "label": "Timeline Activities",
                                "description": "Timeline Activities linked to the task.",
                                "icon": "IconTimelineEvent",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "87c0082f-5411-4202-97cd-fc1d9112fa7a",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4601f72c-580d-4e64-8004-4864f5e60da7",
                                        "nameSingular": "task",
                                        "namePlural": "tasks"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "975e6a19-d90c-45dc-9bb0-ffc57f4e1950",
                                        "name": "timelineActivities"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e095e196-08d4-493c-8a02-01c4a3decb5c",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "e48eeafe-43d8-4abc-95c8-6e7a6a56a7c9",
                                        "name": "task"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "87c0082f-5411-4202-97cd-fc1d9112fa7a",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "e48eeafe-43d8-4abc-95c8-6e7a6a56a7c9",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e095e196-08d4-493c-8a02-01c4a3decb5c",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "91359011-baa5-43a5-9fc2-d46c55c01a50",
                                "type": "UUID",
                                "name": "assigneeId",
                                "label": "Assignee id (foreign key)",
                                "description": "Task assignee id foreign key",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "200825f9-f61c-486d-bafc-c89df63bf661",
                                "type": "DATE_TIME",
                                "name": "dueAt",
                                "label": "Due Date",
                                "description": "Task due date",
                                "icon": "IconCalendarEvent",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "811501e4-0b89-41bb-8571-95bcc3875491",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "61f19623-4e85-4710-867c-a5cc500fb3bc",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "d34f8907-4850-452f-ae0f-2f4e678b74cc",
                                "type": "RICH_TEXT",
                                "name": "body",
                                "label": "Body",
                                "description": "Task body",
                                "icon": "IconFilePencil",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "7c3b7305-e7be-4dbf-9e94-ee354e011f63",
                                "type": "RELATION",
                                "name": "attachments",
                                "label": "Attachments",
                                "description": "Task attachments",
                                "icon": "IconFileImport",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "cc228da1-14c7-4c49-a84d-231ba6166f38",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4601f72c-580d-4e64-8004-4864f5e60da7",
                                        "nameSingular": "task",
                                        "namePlural": "tasks"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "7c3b7305-e7be-4dbf-9e94-ee354e011f63",
                                        "name": "attachments"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "963747ea-45e2-4deb-b36d-73b014e17c42",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "0913c9cc-c3d4-4fd4-9fc7-b758daa08ba4",
                                        "name": "task"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "cc228da1-14c7-4c49-a84d-231ba6166f38",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "0913c9cc-c3d4-4fd4-9fc7-b758daa08ba4",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "963747ea-45e2-4deb-b36d-73b014e17c42",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "ca0bf40d-2ddf-494f-bf1b-754f7c3f9c33",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "4628c7ec-ba15-4567-b386-10d32e338eb7",
                                "type": "POSITION",
                                "name": "position",
                                "label": "Position",
                                "description": "Task record position",
                                "icon": "IconHierarchy2",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "157bef1e-50c2-4c2a-bc48-a5bc790c0f08",
                                "type": "RELATION",
                                "name": "taskTargets",
                                "label": "Targets",
                                "description": "Task targets",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "1cc7a6b5-66d2-40dc-aa08-4b1a252e3ae3",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4601f72c-580d-4e64-8004-4864f5e60da7",
                                        "nameSingular": "task",
                                        "namePlural": "tasks"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "157bef1e-50c2-4c2a-bc48-a5bc790c0f08",
                                        "name": "taskTargets"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "5e92b318-bc10-4fe3-b997-de41b7e45c36",
                                        "nameSingular": "taskTarget",
                                        "namePlural": "taskTargets"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "0f37463a-4a08-44b6-87b6-8175ffa6bff0",
                                        "name": "task"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "1cc7a6b5-66d2-40dc-aa08-4b1a252e3ae3",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "0f37463a-4a08-44b6-87b6-8175ffa6bff0",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "5e92b318-bc10-4fe3-b997-de41b7e45c36",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "taskTarget",
                                        "namePlural": "taskTargets",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "5bcc7e50-73ce-4146-b000-5a336f0e9c40",
                                "type": "RELATION",
                                "name": "assignee",
                                "label": "Assignee",
                                "description": "Task assignee",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "8cb075f2-e51c-4684-80f6-cf6af471e82a",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4601f72c-580d-4e64-8004-4864f5e60da7",
                                        "nameSingular": "task",
                                        "namePlural": "tasks"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5bcc7e50-73ce-4146-b000-5a336f0e9c40",
                                        "name": "assignee"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "e4c25d9f-10cf-4c33-8c39-7aaac0a98f11",
                                        "name": "assignedTasks"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "8cb075f2-e51c-4684-80f6-cf6af471e82a",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "e4c25d9f-10cf-4c33-8c39-7aaac0a98f11",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "d55d2259-62d5-4738-ab6c-07a7293ccb1d",
                                "type": "TEXT",
                                "name": "title",
                                "label": "Title",
                                "description": "Task title",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "4566e731-1922-4610-8e85-0beab7fc57be",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "283bbd7b-1828-47c0-ac12-59b840904057",
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
                                "id": "8028b960-41fe-45a5-bd88-ed41e3ec9f55",
                                "type": "UUID",
                                "name": "workspaceMemberId",
                                "label": "Workspace Member id (foreign key)",
                                "description": "Favorite workspace member id foreign key",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "4a9e3e27-70b0-4ed7-9edf-9126c1675b22",
                                "type": "RELATION",
                                "name": "person",
                                "label": "Person",
                                "description": "Favorite person",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "74f62324-bc36-4210-bb88-e0e6e0136c9f",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4566e731-1922-4610-8e85-0beab7fc57be",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "4a9e3e27-70b0-4ed7-9edf-9126c1675b22",
                                        "name": "person"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "ee426b52-f4d3-4b96-a7fc-04d968b66331",
                                        "name": "favorites"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "74f62324-bc36-4210-bb88-e0e6e0136c9f",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "ee426b52-f4d3-4b96-a7fc-04d968b66331",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "person",
                                        "namePlural": "people",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "2a725662-fe1a-44e8-af06-2ae21c9ae0c2",
                                "type": "RELATION",
                                "name": "opportunity",
                                "label": "Opportunity",
                                "description": "Favorite opportunity",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "2f07395e-a114-465c-a3a2-9c6b990d3dca",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4566e731-1922-4610-8e85-0beab7fc57be",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "2a725662-fe1a-44e8-af06-2ae21c9ae0c2",
                                        "name": "opportunity"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "2e93a9a9-774b-43fd-8338-d54c29b8704c",
                                        "name": "favorites"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "2f07395e-a114-465c-a3a2-9c6b990d3dca",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "2e93a9a9-774b-43fd-8338-d54c29b8704c",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "bdc61888-3791-42db-8276-1e91d7f81054",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "283bbd7b-1828-47c0-ac12-59b840904057",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "0aaf9f83-9b43-4f15-a187-9c11761b367a",
                                "type": "RELATION",
                                "name": "workspaceMember",
                                "label": "Workspace Member",
                                "description": "Favorite workspace member",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "a72edc8d-e5e3-4eae-9fd6-4cb0792b18aa",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4566e731-1922-4610-8e85-0beab7fc57be",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "0aaf9f83-9b43-4f15-a187-9c11761b367a",
                                        "name": "workspaceMember"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "29055851-94dc-4fa9-84d8-295a3d161724",
                                        "name": "favorites"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "a72edc8d-e5e3-4eae-9fd6-4cb0792b18aa",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "29055851-94dc-4fa9-84d8-295a3d161724",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "4fa60a42-bd0d-462c-b05d-d85f96b00458",
                                "type": "RELATION",
                                "name": "company",
                                "label": "Company",
                                "description": "Favorite company",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "632aaba8-f213-4353-95a5-c090168c3ad7",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4566e731-1922-4610-8e85-0beab7fc57be",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "4fa60a42-bd0d-462c-b05d-d85f96b00458",
                                        "name": "company"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "a0df43b7-d926-44a2-ba12-252866607207",
                                        "name": "favorites"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "632aaba8-f213-4353-95a5-c090168c3ad7",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "a0df43b7-d926-44a2-ba12-252866607207",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "company",
                                        "namePlural": "companies",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "539da33b-6863-41b5-9640-555cd190abf6",
                                "type": "NUMBER",
                                "name": "position",
                                "label": "Position",
                                "description": "Favorite position",
                                "icon": "IconList",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": 0,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "0d36e64d-b3aa-43a2-a8d5-26639e695a3c",
                                "type": "UUID",
                                "name": "personId",
                                "label": "Person id (foreign key)",
                                "description": "Favorite person id foreign key",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "f3f3b22c-cd38-4f87-bbf1-333b2661382f",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "9cdaf83f-8f2b-4745-9f5e-ed7e295261ab",
                                "type": "UUID",
                                "name": "opportunityId",
                                "label": "Opportunity id (foreign key)",
                                "description": "Favorite opportunity id foreign key",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "2a2e1910-5dd3-4f52-b164-b05117b51e43",
                                "type": "UUID",
                                "name": "companyId",
                                "label": "Company id (foreign key)",
                                "description": "Favorite company id foreign key",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "3babbb57-d5c5-40e3-8c90-4623c39861f4",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "46a319ab-9265-4f31-914a-b361849a7c93",
                "imageIdentifierFieldMetadataId": null,
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
                                "id": "4f333e42-291b-49c0-8e34-a5011899ad64",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "46a319ab-9265-4f31-914a-b361849a7c93",
                                "type": "TEXT",
                                "name": "targetUrl",
                                "label": "Target Url",
                                "description": "Webhook target url",
                                "icon": "IconLink",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "d5763abd-3ab0-460a-8ce5-f7c69286bdce",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "bf449824-9fba-40d3-85b5-b05101952339",
                                "type": "TEXT",
                                "name": "description",
                                "label": "Description",
                                "description": null,
                                "icon": "IconInfo",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "03d0aab2-d561-4177-9894-9368c5e7fcaf",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "dfa8f17b-8277-47b8-9be0-ccf18d40fa7e",
                                "type": "TEXT",
                                "name": "operation",
                                "label": "Operation",
                                "description": "Webhook operation",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "311ea123-5b30-4637-ae39-3e639e780c83",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "fd617e16-7acc-445c-8e47-bae3df663831",
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
                                "id": "562e521e-c5d5-4ff8-a9c9-1970032b7d31",
                                "type": "DATE_TIME",
                                "name": "syncStageStartedAt",
                                "label": "Sync stage started at",
                                "description": "Sync stage started at",
                                "icon": "IconHistory",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "fd617e16-7acc-445c-8e47-bae3df663831",
                                "type": "TEXT",
                                "name": "handle",
                                "label": "Handle",
                                "description": "Handle",
                                "icon": "IconAt",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "25a76025-cde8-4ced-91c9-83c053d14384",
                                "type": "SELECT",
                                "name": "visibility",
                                "label": "Visibility",
                                "description": "Visibility",
                                "icon": "IconEyeglass",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "'SHARE_EVERYTHING'",
                                "options": [
                                    {
                                        "id": "29cb9455-90fd-4eff-9dcf-f335b86ad0e2",
                                        "color": "green",
                                        "label": "Metadata",
                                        "value": "METADATA",
                                        "position": 0
                                    },
                                    {
                                        "id": "696eef0c-758e-4db3-a897-e8724f3bbb91",
                                        "color": "blue",
                                        "label": "Subject",
                                        "value": "SUBJECT",
                                        "position": 1
                                    },
                                    {
                                        "id": "8a2a24ed-dfb4-4dca-b92f-398b9239ec81",
                                        "color": "orange",
                                        "label": "Share Everything",
                                        "value": "SHARE_EVERYTHING",
                                        "position": 2
                                    }
                                ],
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "3650c95e-adc9-4e10-af9b-f271e3011175",
                                "type": "TEXT",
                                "name": "syncCursor",
                                "label": "Last sync cursor",
                                "description": "Last sync cursor",
                                "icon": "IconHistory",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "4028ab71-03ae-4743-81fa-53e0fc802839",
                                "type": "SELECT",
                                "name": "contactAutoCreationPolicy",
                                "label": "Contact auto creation policy",
                                "description": "Automatically create People records when receiving or sending emails",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "'SENT'",
                                "options": [
                                    {
                                        "id": "db68b799-8701-4d82-8496-0dc007f0f352",
                                        "color": "green",
                                        "label": "Sent and Received",
                                        "value": "SENT_AND_RECEIVED",
                                        "position": 0
                                    },
                                    {
                                        "id": "4e01422b-7a3e-4dc5-a3f7-8ffe8a0ce561",
                                        "color": "blue",
                                        "label": "Sent",
                                        "value": "SENT",
                                        "position": 1
                                    },
                                    {
                                        "id": "41656b1a-4c84-44b1-8b23-44740840b68e",
                                        "color": "red",
                                        "label": "None",
                                        "value": "NONE",
                                        "position": 2
                                    }
                                ],
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "0f338b41-0db1-45ae-bd58-7db0f1623d73",
                                "type": "SELECT",
                                "name": "syncStage",
                                "label": "Sync stage",
                                "description": "Sync stage",
                                "icon": "IconStatusChange",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "'FULL_MESSAGE_LIST_FETCH_PENDING'",
                                "options": [
                                    {
                                        "id": "5d0c8e59-584c-47d4-818b-6b28d6aa6c63",
                                        "color": "blue",
                                        "label": "Full messages list fetch pending",
                                        "value": "FULL_MESSAGE_LIST_FETCH_PENDING",
                                        "position": 0
                                    },
                                    {
                                        "id": "460f32ef-f8fd-4744-bb0d-e78991e3ad43",
                                        "color": "blue",
                                        "label": "Partial messages list fetch pending",
                                        "value": "PARTIAL_MESSAGE_LIST_FETCH_PENDING",
                                        "position": 1
                                    },
                                    {
                                        "id": "daecc0da-ec0b-45ab-ad2d-2240945a3401",
                                        "color": "orange",
                                        "label": "Messages list fetch ongoing",
                                        "value": "MESSAGE_LIST_FETCH_ONGOING",
                                        "position": 2
                                    },
                                    {
                                        "id": "4d2db113-0d55-4b08-aa62-d046cba0355e",
                                        "color": "blue",
                                        "label": "Messages import pending",
                                        "value": "MESSAGES_IMPORT_PENDING",
                                        "position": 3
                                    },
                                    {
                                        "id": "36352f84-d97b-4762-b1a1-f10c2174831e",
                                        "color": "orange",
                                        "label": "Messages import ongoing",
                                        "value": "MESSAGES_IMPORT_ONGOING",
                                        "position": 4
                                    },
                                    {
                                        "id": "8f3c45c2-8539-48bb-83a0-4af18f9f7852",
                                        "color": "red",
                                        "label": "Failed",
                                        "value": "FAILED",
                                        "position": 5
                                    }
                                ],
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "3b94c079-895b-4334-ae18-08d6892a5b7c",
                                "type": "BOOLEAN",
                                "name": "isContactAutoCreationEnabled",
                                "label": "Is Contact Auto Creation Enabled",
                                "description": "Is Contact Auto Creation Enabled",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": true,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "cc44284e-0f2a-4d29-89b0-12416ed5db94",
                                "type": "NUMBER",
                                "name": "throttleFailureCount",
                                "label": "Throttle Failure Count",
                                "description": "Throttle Failure Count",
                                "icon": "IconX",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": 0,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "415b8ccc-aa22-4fdc-933c-bbaf477ff84b",
                                "type": "SELECT",
                                "name": "syncStatus",
                                "label": "Sync status",
                                "description": "Sync status",
                                "icon": "IconStatusChange",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": [
                                    {
                                        "id": "38d30f8d-c137-46a6-b4a8-6e3cf681fe1f",
                                        "color": "yellow",
                                        "label": "Ongoing",
                                        "value": "ONGOING",
                                        "position": 1
                                    },
                                    {
                                        "id": "e10615dc-208c-4e59-85bb-a109111c3888",
                                        "color": "blue",
                                        "label": "Not Synced",
                                        "value": "NOT_SYNCED",
                                        "position": 2
                                    },
                                    {
                                        "id": "f600af02-8be4-4dcd-9880-ed8e00576f20",
                                        "color": "green",
                                        "label": "Active",
                                        "value": "ACTIVE",
                                        "position": 3
                                    },
                                    {
                                        "id": "18ff3cfe-7680-4065-8400-6b2a31553de4",
                                        "color": "red",
                                        "label": "Failed Insufficient Permissions",
                                        "value": "FAILED_INSUFFICIENT_PERMISSIONS",
                                        "position": 4
                                    },
                                    {
                                        "id": "f0bdbb33-e57d-4f14-8696-077c0edcc3d6",
                                        "color": "red",
                                        "label": "Failed Unknown",
                                        "value": "FAILED_UNKNOWN",
                                        "position": 5
                                    }
                                ],
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "90feafa8-c1c8-4c02-97cc-4b2779f64991",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "bdd7ff46-118c-44e7-9b2e-cd522a248a8a",
                                "type": "RELATION",
                                "name": "messageChannelMessageAssociations",
                                "label": "Message Channel Association",
                                "description": "Messages from the channel.",
                                "icon": "IconMessage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "40e51c6c-0268-47ca-bab9-4a899391e74b",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "311ea123-5b30-4637-ae39-3e639e780c83",
                                        "nameSingular": "messageChannel",
                                        "namePlural": "messageChannels"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "bdd7ff46-118c-44e7-9b2e-cd522a248a8a",
                                        "name": "messageChannelMessageAssociations"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0985d46f-722d-468f-9fa6-efa219405aa7",
                                        "nameSingular": "messageChannelMessageAssociation",
                                        "namePlural": "messageChannelMessageAssociations"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "34479a8f-e7a4-4069-9f05-08d09113c8dc",
                                        "name": "messageChannel"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "40e51c6c-0268-47ca-bab9-4a899391e74b",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "34479a8f-e7a4-4069-9f05-08d09113c8dc",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0985d46f-722d-468f-9fa6-efa219405aa7",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "messageChannelMessageAssociation",
                                        "namePlural": "messageChannelMessageAssociations",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "1beb00c7-4641-439c-bd91-2d497de10f63",
                                "type": "BOOLEAN",
                                "name": "excludeGroupEmails",
                                "label": "Exclude group emails",
                                "description": "Exclude group emails",
                                "icon": "IconUsersGroup",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": true,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "f4e6c74c-01ba-4afc-83d2-0e5149a35233",
                                "type": "DATE_TIME",
                                "name": "syncedAt",
                                "label": "Last sync date",
                                "description": "Last sync date",
                                "icon": "IconHistory",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "36d2fee2-936b-4b7d-82fc-eecb49f8d142",
                                "type": "SELECT",
                                "name": "type",
                                "label": "Type",
                                "description": "Channel Type",
                                "icon": "IconMessage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "'email'",
                                "options": [
                                    {
                                        "id": "734f44a0-597e-403a-aaab-00ba91d6e832",
                                        "color": "green",
                                        "label": "Email",
                                        "value": "email",
                                        "position": 0
                                    },
                                    {
                                        "id": "2827a65a-b2c7-4515-80d8-7d9c12ad5f8a",
                                        "color": "blue",
                                        "label": "SMS",
                                        "value": "sms",
                                        "position": 1
                                    }
                                ],
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "cefb6cd7-554d-4e70-8f45-fbb8dbd0fe92",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "d288fd3a-8fb0-493d-bec3-31a2c4a7d366",
                                "type": "RELATION",
                                "name": "connectedAccount",
                                "label": "Connected Account",
                                "description": "Connected Account",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "21bbef75-8acf-48bf-80aa-1d26d50aea22",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "311ea123-5b30-4637-ae39-3e639e780c83",
                                        "nameSingular": "messageChannel",
                                        "namePlural": "messageChannels"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "d288fd3a-8fb0-493d-bec3-31a2c4a7d366",
                                        "name": "connectedAccount"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "66cd3a29-e2d8-4efa-8852-d17d7b538efa",
                                        "nameSingular": "connectedAccount",
                                        "namePlural": "connectedAccounts"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "3bf6ad9c-0441-4b8f-8dd0-12d93f83b67a",
                                        "name": "messageChannels"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "21bbef75-8acf-48bf-80aa-1d26d50aea22",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "3bf6ad9c-0441-4b8f-8dd0-12d93f83b67a",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "66cd3a29-e2d8-4efa-8852-d17d7b538efa",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "connectedAccount",
                                        "namePlural": "connectedAccounts",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "e2f86b34-c7ea-41aa-b0cb-dfa171a9380a",
                                "type": "UUID",
                                "name": "connectedAccountId",
                                "label": "Connected Account id (foreign key)",
                                "description": "Connected Account id foreign key",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "a36aa9b7-abbb-4143-949d-42c9f711679f",
                                "type": "BOOLEAN",
                                "name": "isSyncEnabled",
                                "label": "Is Sync Enabled",
                                "description": "Is Sync Enabled",
                                "icon": "IconRefresh",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": true,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "5fc28ad8-3623-4fb8-a872-efe52af486c1",
                                "type": "BOOLEAN",
                                "name": "excludeNonProfessionalEmails",
                                "label": "Exclude non professional emails",
                                "description": "Exclude non professional emails",
                                "icon": "IconBriefcase",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": true,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "0397d2f1-3e81-4521-9abf-1b39c584d8eb",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "3d6fa6cd-b06a-4465-8033-dc0ed8abda9d",
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
                                "id": "18ea34ae-f9bc-4240-b65f-46f0d688135f",
                                "type": "RELATION",
                                "name": "pointOfContact",
                                "label": "Point of Contact",
                                "description": "Opportunity point of contact",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "58a081ed-e5e7-44f8-bae6-99be66b6ac2f",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "18ea34ae-f9bc-4240-b65f-46f0d688135f",
                                        "name": "pointOfContact"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "05863c2c-bcf7-4d88-b0cd-f00335b6854d",
                                        "name": "pointOfContactForOpportunities"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "58a081ed-e5e7-44f8-bae6-99be66b6ac2f",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "05863c2c-bcf7-4d88-b0cd-f00335b6854d",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "person",
                                        "namePlural": "people",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "2e93a9a9-774b-43fd-8338-d54c29b8704c",
                                "type": "RELATION",
                                "name": "favorites",
                                "label": "Favorites",
                                "description": "Favorites linked to the opportunity",
                                "icon": "IconHeart",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "2f07395e-a114-465c-a3a2-9c6b990d3dca",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "2e93a9a9-774b-43fd-8338-d54c29b8704c",
                                        "name": "favorites"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4566e731-1922-4610-8e85-0beab7fc57be",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "2a725662-fe1a-44e8-af06-2ae21c9ae0c2",
                                        "name": "opportunity"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "2f07395e-a114-465c-a3a2-9c6b990d3dca",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "2a725662-fe1a-44e8-af06-2ae21c9ae0c2",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4566e731-1922-4610-8e85-0beab7fc57be",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "4e24ba90-8fcd-4df5-9fe8-48679c75d374",
                                "type": "RELATION",
                                "name": "timelineActivities",
                                "label": "Timeline Activities",
                                "description": "Timeline Activities linked to the opportunity.",
                                "icon": "IconTimelineEvent",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "d8ae1b79-b532-412c-92cf-767a32e3cda2",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "4e24ba90-8fcd-4df5-9fe8-48679c75d374",
                                        "name": "timelineActivities"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e095e196-08d4-493c-8a02-01c4a3decb5c",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "987fd4f6-4c5f-48a4-82f3-fd769de80dc4",
                                        "name": "opportunity"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "d8ae1b79-b532-412c-92cf-767a32e3cda2",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "987fd4f6-4c5f-48a4-82f3-fd769de80dc4",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e095e196-08d4-493c-8a02-01c4a3decb5c",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "3d6fa6cd-b06a-4465-8033-dc0ed8abda9d",
                                "type": "TEXT",
                                "name": "name",
                                "label": "Name",
                                "description": "The opportunity name",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "7e6746ac-3625-4b14-86bc-11adc29e347c",
                                "type": "UUID",
                                "name": "companyId",
                                "label": "Company id (foreign key)",
                                "description": "Opportunity company id foreign key",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "1bab9225-7390-43d7-a2c5-1d14f918efc0",
                                "type": "RELATION",
                                "name": "activityTargets",
                                "label": "Activities",
                                "description": "Activities tied to the opportunity",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "2105fe76-e9fa-4610-992a-261d0f24722d",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "1bab9225-7390-43d7-a2c5-1d14f918efc0",
                                        "name": "activityTargets"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "948a52f8-eba6-4bb2-a3a7-b1aa61c0daf7",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "ddc84553-0678-4697-a8c2-06ddbc136cab",
                                        "name": "opportunity"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "2105fe76-e9fa-4610-992a-261d0f24722d",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "ddc84553-0678-4697-a8c2-06ddbc136cab",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "948a52f8-eba6-4bb2-a3a7-b1aa61c0daf7",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "809ebb3f-8c63-4009-a8b9-3e184d6f140c",
                                "type": "CURRENCY",
                                "name": "amount",
                                "label": "Amount",
                                "description": "Opportunity amount",
                                "icon": "IconCurrencyDollar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": {
                                    "amountMicros": null,
                                    "currencyCode": "''"
                                },
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "100f9c10-11c4-4fee-963a-f98a0e42d05d",
                                "type": "RELATION",
                                "name": "taskTargets",
                                "label": "Tasks",
                                "description": "Tasks tied to the opportunity",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "457627a4-8e4f-4720-80b4-b8c47a49a1d7",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "100f9c10-11c4-4fee-963a-f98a0e42d05d",
                                        "name": "taskTargets"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "5e92b318-bc10-4fe3-b997-de41b7e45c36",
                                        "nameSingular": "taskTarget",
                                        "namePlural": "taskTargets"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "807cfd9f-4081-4027-b646-cf66d81aa8c6",
                                        "name": "opportunity"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "457627a4-8e4f-4720-80b4-b8c47a49a1d7",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "807cfd9f-4081-4027-b646-cf66d81aa8c6",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "5e92b318-bc10-4fe3-b997-de41b7e45c36",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "taskTarget",
                                        "namePlural": "taskTargets",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "21626287-1f6d-4604-869f-59b77b98e529",
                                "type": "DATE_TIME",
                                "name": "closeDate",
                                "label": "Close date",
                                "description": "Opportunity close date",
                                "icon": "IconCalendarEvent",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "a9d9912d-6f0d-4ddb-85ce-48acbba6ae00",
                                "type": "SELECT",
                                "name": "stage",
                                "label": "Stage",
                                "description": "Opportunity stage",
                                "icon": "IconProgressCheck",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "'NEW'",
                                "options": [
                                    {
                                        "id": "c8c92b5e-af59-4c21-a68c-c2dbdd513b2c",
                                        "color": "red",
                                        "label": "New",
                                        "value": "NEW",
                                        "position": 0
                                    },
                                    {
                                        "id": "b33eff93-1fec-4275-97f0-03beb704a709",
                                        "color": "purple",
                                        "label": "Screening",
                                        "value": "SCREENING",
                                        "position": 1
                                    },
                                    {
                                        "id": "d4fff9a7-53ea-4e10-a16e-b721133f9cda",
                                        "color": "sky",
                                        "label": "Meeting",
                                        "value": "MEETING",
                                        "position": 2
                                    },
                                    {
                                        "id": "e0b16f06-4e59-4f8c-ac30-a6e3fc37eac8",
                                        "color": "turquoise",
                                        "label": "Proposal",
                                        "value": "PROPOSAL",
                                        "position": 3
                                    },
                                    {
                                        "id": "a0ad0f8d-fed5-49c0-8dfd-00be4521db24",
                                        "color": "yellow",
                                        "label": "Customer",
                                        "value": "CUSTOMER",
                                        "position": 4
                                    }
                                ],
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "1433c5e0-2dfc-404b-b04e-17126fd75e0a",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "727ec83b-93b7-4e6b-be22-6f00637ec3f5",
                                "type": "RELATION",
                                "name": "company",
                                "label": "Company",
                                "description": "Opportunity company",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "1ebadb76-46e6-4c57-b24f-441acecbd2d9",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "727ec83b-93b7-4e6b-be22-6f00637ec3f5",
                                        "name": "company"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "34aec238-a534-46e7-be64-d0680a12c8ec",
                                        "name": "opportunities"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "1ebadb76-46e6-4c57-b24f-441acecbd2d9",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "34aec238-a534-46e7-be64-d0680a12c8ec",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "701aecf9-eb1c-4d84-9d94-b954b231b64b",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "company",
                                        "namePlural": "companies",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "89f08f6a-f94a-4f1c-823b-8e5513362c0b",
                                "type": "ACTOR",
                                "name": "createdBy",
                                "label": "Created by",
                                "description": "The creator of the record",
                                "icon": "IconCreativeCommonsSa",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": {
                                    "name": "''",
                                    "source": "'MANUAL'"
                                },
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "8ac2f70d-3c5d-40a2-835c-849ae6c1ab81",
                                "type": "UUID",
                                "name": "pointOfContactId",
                                "label": "Point of Contact id (foreign key)",
                                "description": "Opportunity point of contact id foreign key",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "095b38a6-1881-40b8-9849-cb80d19aa295",
                                "type": "RELATION",
                                "name": "attachments",
                                "label": "Attachments",
                                "description": "Attachments linked to the opportunity",
                                "icon": "IconFileImport",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "c20ecc99-e48a-4311-b850-8fbf1a7b68ea",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "095b38a6-1881-40b8-9849-cb80d19aa295",
                                        "name": "attachments"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "963747ea-45e2-4deb-b36d-73b014e17c42",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "b4868b15-ff98-4f36-9f59-1dbf63052bb7",
                                        "name": "opportunity"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "c20ecc99-e48a-4311-b850-8fbf1a7b68ea",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "b4868b15-ff98-4f36-9f59-1dbf63052bb7",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "963747ea-45e2-4deb-b36d-73b014e17c42",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "f74b36a5-caf7-4318-994b-251eb2be2668",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "e6fe20c1-091e-418f-9ff0-8ea7cfb864f8",
                                "type": "RELATION",
                                "name": "noteTargets",
                                "label": "Notes",
                                "description": "Notes tied to the opportunity",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "c0946e53-4cdd-46b4-b30a-9fce040b9a7a",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2dbf5d59-f03c-4578-8ff3-750f4bcdf8d0",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "e6fe20c1-091e-418f-9ff0-8ea7cfb864f8",
                                        "name": "noteTargets"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dcb774a3-71e8-44cc-bf53-7f195e0bfdb6",
                                        "nameSingular": "noteTarget",
                                        "namePlural": "noteTargets"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5b2ec790-e8b8-4bd0-bf1b-db4ebc2b473a",
                                        "name": "opportunity"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "c0946e53-4cdd-46b4-b30a-9fce040b9a7a",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "5b2ec790-e8b8-4bd0-bf1b-db4ebc2b473a",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dcb774a3-71e8-44cc-bf53-7f195e0bfdb6",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "noteTarget",
                                        "namePlural": "noteTargets",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "206e678d-dc5d-4e69-b3e0-a16f9ec59676",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "7717144e-ac08-4f29-8614-f12ad830ce5a",
                                "type": "POSITION",
                                "name": "position",
                                "label": "Position",
                                "description": "Opportunity record position",
                                "icon": "IconHierarchy2",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "2c6e4a32-28cd-4a72-8ca6-915fd819ed32",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "edfa9baf-6165-4be4-9f0f-0831c167cc43",
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
                                "id": "92815f89-9c9d-4fc7-b0b0-dd9c0ca24fe7",
                                "type": "TEXT",
                                "name": "type",
                                "label": "Type",
                                "description": "View type",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "'table'",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "15896bc9-fb20-4c1f-bc0d-f3abe768d388",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "7a703490-9619-44e3-a1d7-95b37f128d7c",
                                "type": "SELECT",
                                "name": "key",
                                "label": "Key",
                                "description": "View key",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "'INDEX'",
                                "options": [
                                    {
                                        "id": "590b78a5-1851-436a-b696-acc719fa4be8",
                                        "color": "red",
                                        "label": "Index",
                                        "value": "INDEX",
                                        "position": 0
                                    }
                                ],
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "78afce65-d674-42b7-90dd-f61238fdbcf1",
                                "type": "TEXT",
                                "name": "icon",
                                "label": "Icon",
                                "description": "View icon",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "c086b30a-0267-4857-9fe0-29a2bbaa8dc8",
                                "type": "RELATION",
                                "name": "viewFields",
                                "label": "View Fields",
                                "description": "View Fields",
                                "icon": "IconTag",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "ae731975-39ee-4387-a80c-de94dff0b760",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2c6e4a32-28cd-4a72-8ca6-915fd819ed32",
                                        "nameSingular": "view",
                                        "namePlural": "views"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "c086b30a-0267-4857-9fe0-29a2bbaa8dc8",
                                        "name": "viewFields"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c81903be-3be2-49af-82b3-d170cd35ac0f",
                                        "nameSingular": "viewField",
                                        "namePlural": "viewFields"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "337d9389-06a9-4cb1-9f2a-76dbb37a7576",
                                        "name": "view"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "ae731975-39ee-4387-a80c-de94dff0b760",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "337d9389-06a9-4cb1-9f2a-76dbb37a7576",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c81903be-3be2-49af-82b3-d170cd35ac0f",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "viewField",
                                        "namePlural": "viewFields",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "edfa9baf-6165-4be4-9f0f-0831c167cc43",
                                "type": "TEXT",
                                "name": "name",
                                "label": "Name",
                                "description": "View name",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "5969cfdb-bf30-4a34-9b52-11b38945bbd0",
                                "type": "RELATION",
                                "name": "viewSorts",
                                "label": "View Sorts",
                                "description": "View Sorts",
                                "icon": "IconArrowsSort",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "fcf27acc-a651-4ac2-9f99-aba306756209",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2c6e4a32-28cd-4a72-8ca6-915fd819ed32",
                                        "nameSingular": "view",
                                        "namePlural": "views"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5969cfdb-bf30-4a34-9b52-11b38945bbd0",
                                        "name": "viewSorts"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "718779fd-d87d-4b99-8f6c-3042a6bb03a3",
                                        "nameSingular": "viewSort",
                                        "namePlural": "viewSorts"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "2c09d04d-007c-4652-9c90-c2cfa4696145",
                                        "name": "view"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "fcf27acc-a651-4ac2-9f99-aba306756209",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "2c09d04d-007c-4652-9c90-c2cfa4696145",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "718779fd-d87d-4b99-8f6c-3042a6bb03a3",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "viewSort",
                                        "namePlural": "viewSorts",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "563534f3-90f6-42f8-9dbc-0f067ca5424c",
                                "type": "POSITION",
                                "name": "position",
                                "label": "Position",
                                "description": "View position",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "8fd9225d-5f08-4e21-a0cf-d596d4ec1eaf",
                                "type": "UUID",
                                "name": "objectMetadataId",
                                "label": "Object Metadata Id",
                                "description": "View target object",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "4f92f2f0-9204-4f23-afdc-894829664668",
                                "type": "RELATION",
                                "name": "viewFilters",
                                "label": "View Filters",
                                "description": "View Filters",
                                "icon": "IconFilterBolt",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "7c42db51-2fcc-44b6-9a80-787b1967e69e",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "2c6e4a32-28cd-4a72-8ca6-915fd819ed32",
                                        "nameSingular": "view",
                                        "namePlural": "views"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "4f92f2f0-9204-4f23-afdc-894829664668",
                                        "name": "viewFilters"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "816a7154-5111-47fa-9d8d-87ca2dafc521",
                                        "nameSingular": "viewFilter",
                                        "namePlural": "viewFilters"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "0f9c4eb8-501d-4861-827a-5ef45a01eba9",
                                        "name": "view"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "7c42db51-2fcc-44b6-9a80-787b1967e69e",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "0f9c4eb8-501d-4861-827a-5ef45a01eba9",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "816a7154-5111-47fa-9d8d-87ca2dafc521",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "viewFilter",
                                        "namePlural": "viewFilters",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "5c342176-2358-4269-9293-f7666691b1ff",
                                "type": "TEXT",
                                "name": "kanbanFieldMetadataId",
                                "label": "kanbanfieldMetadataId",
                                "description": "View Kanban column field",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "193fbb6a-6c71-4871-92dc-d4b71b856b83",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "87c37d2e-9457-47f3-bdf4-41879bb81b90",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "80e2dcf2-ffff-45db-adbc-174d739f1fb6",
                                "type": "BOOLEAN",
                                "name": "isCompact",
                                "label": "Compact View",
                                "description": "Describes if the view is in compact mode",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": false,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "1f73c3c3-a356-4a70-8a91-948e70120fdf",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "408fe748-df73-4975-b473-8260e9da2e4b",
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
                                "id": "9016096d-93c4-495f-93d5-b966e5bedc74",
                                "type": "RELATION",
                                "name": "messages",
                                "label": "Messages",
                                "description": "Messages from the thread.",
                                "icon": "IconMessage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "c958fe88-7d66-4c1b-87c7-55ab724f42c5",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "1f73c3c3-a356-4a70-8a91-948e70120fdf",
                                        "nameSingular": "messageThread",
                                        "namePlural": "messageThreads"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "9016096d-93c4-495f-93d5-b966e5bedc74",
                                        "name": "messages"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dfdcf91e-f4b4-4460-8c89-919ef501fd79",
                                        "nameSingular": "message",
                                        "namePlural": "messages"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "114f853e-2684-4e62-92c9-0213ace3c498",
                                        "name": "messageThread"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "c958fe88-7d66-4c1b-87c7-55ab724f42c5",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "114f853e-2684-4e62-92c9-0213ace3c498",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dfdcf91e-f4b4-4460-8c89-919ef501fd79",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "message",
                                        "namePlural": "messages",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "6fe89951-20b6-4ef3-81d8-08498b09954b",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "25bbf51f-17fa-4a2c-9636-3f3fdba41e08",
                                "type": "RELATION",
                                "name": "messageChannelMessageAssociations",
                                "label": "Message Channel Association",
                                "description": "Messages from the channel",
                                "icon": "IconMessage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "1d8cbabc-edf5-40c9-8bd5-d1e47a93d246",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "1f73c3c3-a356-4a70-8a91-948e70120fdf",
                                        "nameSingular": "messageThread",
                                        "namePlural": "messageThreads"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "25bbf51f-17fa-4a2c-9636-3f3fdba41e08",
                                        "name": "messageChannelMessageAssociations"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0985d46f-722d-468f-9fa6-efa219405aa7",
                                        "nameSingular": "messageChannelMessageAssociation",
                                        "namePlural": "messageChannelMessageAssociations"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "fcbef4a3-f1d9-4714-b7ea-f44816821d6e",
                                        "name": "messageThread"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "1d8cbabc-edf5-40c9-8bd5-d1e47a93d246",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "fcbef4a3-f1d9-4714-b7ea-f44816821d6e",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0985d46f-722d-468f-9fa6-efa219405aa7",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "messageChannelMessageAssociation",
                                        "namePlural": "messageChannelMessageAssociations",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "aef283f1-b060-4de8-a5b9-f1ef4e4c0bb4",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "408fe748-df73-4975-b473-8260e9da2e4b",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "0e285964-d858-48bc-98ab-b8c6b1bd5d0b",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "2cfd31ac-4391-4922-a640-38ac515564fc",
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
                                "id": "31ed435c-f012-4dfb-8825-35c522129243",
                                "type": "BOOLEAN",
                                "name": "isSyncEnabled",
                                "label": "Is Sync Enabled",
                                "description": "Is Sync Enabled",
                                "icon": "IconRefresh",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": true,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "4faab073-db9b-4644-8a16-57eb573c428d",
                                "type": "SELECT",
                                "name": "syncStage",
                                "label": "Sync stage",
                                "description": "Sync stage",
                                "icon": "IconStatusChange",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "'FULL_CALENDAR_EVENT_LIST_FETCH_PENDING'",
                                "options": [
                                    {
                                        "id": "74fb48bf-87b9-4094-8c46-4f74128e78d8",
                                        "color": "blue",
                                        "label": "Full calendar event list fetch pending",
                                        "value": "FULL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                                        "position": 0
                                    },
                                    {
                                        "id": "f0b2944c-b9e4-4889-b405-99e023b69a65",
                                        "color": "blue",
                                        "label": "Partial calendar event list fetch pending",
                                        "value": "PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                                        "position": 1
                                    },
                                    {
                                        "id": "ec321870-1e95-4a7e-bc9d-ea58d0020d43",
                                        "color": "orange",
                                        "label": "Calendar event list fetch ongoing",
                                        "value": "CALENDAR_EVENT_LIST_FETCH_ONGOING",
                                        "position": 2
                                    },
                                    {
                                        "id": "bf48f26c-8ce9-43cf-a89a-53e7fbb1afc6",
                                        "color": "blue",
                                        "label": "Calendar events import pending",
                                        "value": "CALENDAR_EVENTS_IMPORT_PENDING",
                                        "position": 3
                                    },
                                    {
                                        "id": "d3d349ad-b3bf-4762-8aad-92796cd86e08",
                                        "color": "orange",
                                        "label": "Calendar events import ongoing",
                                        "value": "CALENDAR_EVENTS_IMPORT_ONGOING",
                                        "position": 4
                                    },
                                    {
                                        "id": "7a882ecb-67ae-42c4-bac7-216c6b8522c4",
                                        "color": "red",
                                        "label": "Failed",
                                        "value": "FAILED",
                                        "position": 5
                                    }
                                ],
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "b1d2c87b-9e88-44b7-9b2d-138d359c28df",
                                "type": "SELECT",
                                "name": "syncStatus",
                                "label": "Sync status",
                                "description": "Sync status",
                                "icon": "IconStatusChange",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": [
                                    {
                                        "id": "ab4ddbc1-8af6-4f9e-a3e9-f87a18e47951",
                                        "color": "yellow",
                                        "label": "Ongoing",
                                        "value": "ONGOING",
                                        "position": 1
                                    },
                                    {
                                        "id": "bee7589a-9d59-4b01-9d9b-ef45dd4c17ca",
                                        "color": "blue",
                                        "label": "Not Synced",
                                        "value": "NOT_SYNCED",
                                        "position": 2
                                    },
                                    {
                                        "id": "11fad735-37f3-4297-9da4-0251355ff461",
                                        "color": "green",
                                        "label": "Active",
                                        "value": "ACTIVE",
                                        "position": 3
                                    },
                                    {
                                        "id": "e7da6feb-df29-49f4-b5ba-a82534490e5c",
                                        "color": "red",
                                        "label": "Failed Insufficient Permissions",
                                        "value": "FAILED_INSUFFICIENT_PERMISSIONS",
                                        "position": 4
                                    },
                                    {
                                        "id": "61ae12e3-22e5-4971-9044-3ed274567b29",
                                        "color": "red",
                                        "label": "Failed Unknown",
                                        "value": "FAILED_UNKNOWN",
                                        "position": 5
                                    }
                                ],
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "3e26b011-c7eb-44ff-9599-15b85ef5576d",
                                "type": "SELECT",
                                "name": "visibility",
                                "label": "Visibility",
                                "description": "Visibility",
                                "icon": "IconEyeglass",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "'SHARE_EVERYTHING'",
                                "options": [
                                    {
                                        "id": "d27d8a0e-d892-4581-b982-500f33b53803",
                                        "color": "green",
                                        "label": "Metadata",
                                        "value": "METADATA",
                                        "position": 0
                                    },
                                    {
                                        "id": "fa61ab2d-1e83-4a01-8526-81c8460cc7dc",
                                        "color": "orange",
                                        "label": "Share Everything",
                                        "value": "SHARE_EVERYTHING",
                                        "position": 1
                                    }
                                ],
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "ceaf8f8e-297a-418b-a652-01f3eeb5c562",
                                "type": "RELATION",
                                "name": "connectedAccount",
                                "label": "Connected Account",
                                "description": "Connected Account",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "b6b75323-8790-4b3e-8798-e0af646bb9aa",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0e285964-d858-48bc-98ab-b8c6b1bd5d0b",
                                        "nameSingular": "calendarChannel",
                                        "namePlural": "calendarChannels"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "ceaf8f8e-297a-418b-a652-01f3eeb5c562",
                                        "name": "connectedAccount"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "66cd3a29-e2d8-4efa-8852-d17d7b538efa",
                                        "nameSingular": "connectedAccount",
                                        "namePlural": "connectedAccounts"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "bb10e69d-f049-4d97-84f4-09bce29cd401",
                                        "name": "calendarChannels"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "b6b75323-8790-4b3e-8798-e0af646bb9aa",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "bb10e69d-f049-4d97-84f4-09bce29cd401",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "66cd3a29-e2d8-4efa-8852-d17d7b538efa",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "connectedAccount",
                                        "namePlural": "connectedAccounts",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "284f9e52-0885-4860-98ea-2083911aa453",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "3127b8eb-f998-4987-a797-01a8943e677a",
                                "type": "UUID",
                                "name": "connectedAccountId",
                                "label": "Connected Account id (foreign key)",
                                "description": "Connected Account id foreign key",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "fd92e8cd-5f05-49e7-aa15-ae8c3a8905d6",
                                "type": "DATE_TIME",
                                "name": "syncStageStartedAt",
                                "label": "Sync stage started at",
                                "description": "Sync stage started at",
                                "icon": "IconHistory",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "9867ad34-df58-4ad0-a459-cc283990b5e5",
                                "type": "RELATION",
                                "name": "calendarChannelEventAssociations",
                                "label": "Calendar Channel Event Associations",
                                "description": "Calendar Channel Event Associations",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "bf0f695a-08cd-4767-9a83-4fd09f617793",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0e285964-d858-48bc-98ab-b8c6b1bd5d0b",
                                        "nameSingular": "calendarChannel",
                                        "namePlural": "calendarChannels"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "9867ad34-df58-4ad0-a459-cc283990b5e5",
                                        "name": "calendarChannelEventAssociations"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4fed9657-e68b-4856-8e6d-a1c860d16242",
                                        "nameSingular": "calendarChannelEventAssociation",
                                        "namePlural": "calendarChannelEventAssociations"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "d3039865-07b4-4114-bd78-18aa0be2a93b",
                                        "name": "calendarChannel"
                                    }
                                },
                                "toRelationMetadata": null,
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "bf0f695a-08cd-4767-9a83-4fd09f617793",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "d3039865-07b4-4114-bd78-18aa0be2a93b",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "4fed9657-e68b-4856-8e6d-a1c860d16242",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "calendarChannelEventAssociation",
                                        "namePlural": "calendarChannelEventAssociations",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "1da10e0f-ddc1-441e-8d88-c2453ea397f7",
                                "type": "BOOLEAN",
                                "name": "isContactAutoCreationEnabled",
                                "label": "Is Contact Auto Creation Enabled",
                                "description": "Is Contact Auto Creation Enabled",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": true,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "2cfd31ac-4391-4922-a640-38ac515564fc",
                                "type": "TEXT",
                                "name": "handle",
                                "label": "Handle",
                                "description": "Handle",
                                "icon": "IconAt",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "c62bba75-6421-4fd0-966c-6749870b0b5b",
                                "type": "NUMBER",
                                "name": "throttleFailureCount",
                                "label": "Throttle Failure Count",
                                "description": "Throttle Failure Count",
                                "icon": "IconX",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": 0,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "ae2fc211-7736-43b8-a7e2-b08476446ea5",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "e4ede7f5-3c11-4e77-9327-fe433429105b",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "ee994c99-3f91-4d2a-9956-449ab18af0e7",
                                "type": "SELECT",
                                "name": "contactAutoCreationPolicy",
                                "label": "Contact auto creation policy",
                                "description": "Automatically create records for people you participated with in an event.",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "'AS_PARTICIPANT_AND_ORGANIZER'",
                                "options": [
                                    {
                                        "id": "add1e0ce-43a9-457a-b7ba-8ddd71acff41",
                                        "color": "green",
                                        "label": "As Participant and Organizer",
                                        "value": "AS_PARTICIPANT_AND_ORGANIZER",
                                        "position": 0
                                    },
                                    {
                                        "id": "93ef8799-ed7b-42f8-a4a4-b878c9599108",
                                        "color": "orange",
                                        "label": "As Participant",
                                        "value": "AS_PARTICIPANT",
                                        "position": 1
                                    },
                                    {
                                        "id": "a94610a1-429d-449e-ae0b-67eaba058ef8",
                                        "color": "blue",
                                        "label": "As Organizer",
                                        "value": "AS_ORGANIZER",
                                        "position": 2
                                    },
                                    {
                                        "id": "ca729343-a09c-486b-a240-5d80e7e076eb",
                                        "color": "red",
                                        "label": "None",
                                        "value": "NONE",
                                        "position": 3
                                    }
                                ],
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "c31280e5-0ed4-49e3-8f52-0d301698db1d",
                                "type": "TEXT",
                                "name": "syncCursor",
                                "label": "Sync Cursor",
                                "description": "Sync Cursor. Used for syncing events from the calendar provider",
                                "icon": "IconReload",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "0c0a3db9-f3ba-485a-8dff-488c477f3fa6",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "3a3ffcd3-9a78-4eed-ae5b-6838156857fe",
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
                                "id": "90e73039-1ac8-4d7c-9d65-301373ade28b",
                                "type": "TEXT",
                                "name": "displayName",
                                "label": "Display Name",
                                "description": "Display Name",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "5b46d192-34b1-4122-801c-7b6f74b49743",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "5353cebc-8357-49bd-bcf2-292409d637ba",
                                "type": "UUID",
                                "name": "workspaceMemberId",
                                "label": "Workspace Member id (foreign key)",
                                "description": "Workspace member id foreign key",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "bc788a8f-8eb2-47bf-a02c-42f7de197ca8",
                                "type": "RELATION",
                                "name": "workspaceMember",
                                "label": "Workspace Member",
                                "description": "Workspace member",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "7d3faf56-e4bb-45ec-9b75-612ca6e9ae5a",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0c0a3db9-f3ba-485a-8dff-488c477f3fa6",
                                        "nameSingular": "messageParticipant",
                                        "namePlural": "messageParticipants"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "bc788a8f-8eb2-47bf-a02c-42f7de197ca8",
                                        "name": "workspaceMember"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "c00ccd93-ebc7-4744-8cb3-797a752b4627",
                                        "name": "messageParticipants"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "7d3faf56-e4bb-45ec-9b75-612ca6e9ae5a",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "c00ccd93-ebc7-4744-8cb3-797a752b4627",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b87720c6-bead-46a9-8c1e-c8596bdb702e",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "f897f356-ea94-4bd4-869a-4c138e57704e",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "3a3ffcd3-9a78-4eed-ae5b-6838156857fe",
                                "type": "TEXT",
                                "name": "handle",
                                "label": "Handle",
                                "description": "Handle",
                                "icon": "IconAt",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "728a4a3f-1145-48cb-804e-b790fdf1c0f4",
                                "type": "UUID",
                                "name": "personId",
                                "label": "Person id (foreign key)",
                                "description": "Person id foreign key",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "52b01517-9ac7-48d9-a292-b969197a33f5",
                                "type": "UUID",
                                "name": "messageId",
                                "label": "Message id (foreign key)",
                                "description": "Message id foreign key",
                                "icon": "IconMessage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "660b4257-010e-4039-897a-e274f2559ed5",
                                "type": "RELATION",
                                "name": "message",
                                "label": "Message",
                                "description": "Message",
                                "icon": "IconMessage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "2180d888-98dc-428e-a157-c30ce7bf8ce4",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0c0a3db9-f3ba-485a-8dff-488c477f3fa6",
                                        "nameSingular": "messageParticipant",
                                        "namePlural": "messageParticipants"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "660b4257-010e-4039-897a-e274f2559ed5",
                                        "name": "message"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dfdcf91e-f4b4-4460-8c89-919ef501fd79",
                                        "nameSingular": "message",
                                        "namePlural": "messages"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "15658254-6562-4fad-9ef3-393f913e95c2",
                                        "name": "messageParticipants"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "2180d888-98dc-428e-a157-c30ce7bf8ce4",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "15658254-6562-4fad-9ef3-393f913e95c2",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dfdcf91e-f4b4-4460-8c89-919ef501fd79",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "message",
                                        "namePlural": "messages",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "362195e4-4dfb-49e1-b25b-fe3ffe7b7f14",
                                "type": "RELATION",
                                "name": "person",
                                "label": "Person",
                                "description": "Person",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "5bb99199-6a3c-4947-b16b-6a90c6097eac",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0c0a3db9-f3ba-485a-8dff-488c477f3fa6",
                                        "nameSingular": "messageParticipant",
                                        "namePlural": "messageParticipants"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "362195e4-4dfb-49e1-b25b-fe3ffe7b7f14",
                                        "name": "person"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "19f77ace-4b00-4fac-ba7d-8c7a3dde409b",
                                        "name": "messageParticipants"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "5bb99199-6a3c-4947-b16b-6a90c6097eac",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "19f77ace-4b00-4fac-ba7d-8c7a3dde409b",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "aeffaa4e-cae1-4dd8-b76e-5658eb73d0a9",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "person",
                                        "namePlural": "people",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "6dec8f79-0674-48e8-9b01-74585880e8a2",
                                "type": "SELECT",
                                "name": "role",
                                "label": "Role",
                                "description": "Role",
                                "icon": "IconAt",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "'from'",
                                "options": [
                                    {
                                        "id": "f105c9e6-9a17-4cb0-bede-fd7dc67cdeb7",
                                        "color": "green",
                                        "label": "From",
                                        "value": "from",
                                        "position": 0
                                    },
                                    {
                                        "id": "a8fa2086-b0bd-48cf-914d-247be3fef5fd",
                                        "color": "blue",
                                        "label": "To",
                                        "value": "to",
                                        "position": 1
                                    },
                                    {
                                        "id": "2b763815-9fc7-4b47-a364-f6cb639ef609",
                                        "color": "orange",
                                        "label": "Cc",
                                        "value": "cc",
                                        "position": 2
                                    },
                                    {
                                        "id": "23b26d79-b074-44d1-a910-25ecb3ff808a",
                                        "color": "red",
                                        "label": "Bcc",
                                        "value": "bcc",
                                        "position": 3
                                    }
                                ],
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "66a43663-68e0-404d-9e36-63be0bd5e406",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "0985d46f-722d-468f-9fa6-efa219405aa7",
                "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
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
                "createdAt": "2024-08-02T16:00:05.938Z",
                "updatedAt": "2024-08-02T16:00:05.938Z",
                "labelIdentifierFieldMetadataId": "6cb4b092-b140-4f6c-97d6-0f7f7d3ae6f7",
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
                                "id": "7f9297fa-ca06-4da9-9a6c-83028f25ba88",
                                "type": "UUID",
                                "name": "messageId",
                                "label": "Message Id id (foreign key)",
                                "description": "Message Id id foreign key",
                                "icon": "IconHash",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "9810950a-952a-412b-a590-be91bbb7efcd",
                                "type": "TEXT",
                                "name": "messageExternalId",
                                "label": "Message External Id",
                                "description": "Message id from the messaging provider",
                                "icon": "IconHash",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "6d269e30-23a1-4963-8c78-4bdf7108875c",
                                "type": "UUID",
                                "name": "messageChannelId",
                                "label": "Message Channel Id id (foreign key)",
                                "description": "Message Channel Id id foreign key",
                                "icon": "IconHash",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "f2b8af0c-5143-4715-b0ef-0ecf06874fa7",
                                "type": "TEXT",
                                "name": "messageThreadExternalId",
                                "label": "Thread External Id",
                                "description": "Thread id from the messaging provider",
                                "icon": "IconHash",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "''",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "3f3c11b1-b1b5-4831-9a4e-963317c8c9a5",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "785c0609-42b8-4b0e-b7c2-4d54b6ed651f",
                                "type": "RELATION",
                                "name": "message",
                                "label": "Message Id",
                                "description": "Message Id",
                                "icon": "IconHash",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "642b4d8c-f2f8-4590-abce-4b112d8689ba",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0985d46f-722d-468f-9fa6-efa219405aa7",
                                        "nameSingular": "messageChannelMessageAssociation",
                                        "namePlural": "messageChannelMessageAssociations"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "785c0609-42b8-4b0e-b7c2-4d54b6ed651f",
                                        "name": "message"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dfdcf91e-f4b4-4460-8c89-919ef501fd79",
                                        "nameSingular": "message",
                                        "namePlural": "messages"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "2ac789bf-ce05-4f0e-9f04-f848f93c2f21",
                                        "name": "messageChannelMessageAssociations"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "642b4d8c-f2f8-4590-abce-4b112d8689ba",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "2ac789bf-ce05-4f0e-9f04-f848f93c2f21",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dfdcf91e-f4b4-4460-8c89-919ef501fd79",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "message",
                                        "namePlural": "messages",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "34479a8f-e7a4-4069-9f05-08d09113c8dc",
                                "type": "RELATION",
                                "name": "messageChannel",
                                "label": "Message Channel Id",
                                "description": "Message Channel Id",
                                "icon": "IconHash",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "40e51c6c-0268-47ca-bab9-4a899391e74b",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0985d46f-722d-468f-9fa6-efa219405aa7",
                                        "nameSingular": "messageChannelMessageAssociation",
                                        "namePlural": "messageChannelMessageAssociations"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "34479a8f-e7a4-4069-9f05-08d09113c8dc",
                                        "name": "messageChannel"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "311ea123-5b30-4637-ae39-3e639e780c83",
                                        "nameSingular": "messageChannel",
                                        "namePlural": "messageChannels"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "bdd7ff46-118c-44e7-9b2e-cd522a248a8a",
                                        "name": "messageChannelMessageAssociations"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "40e51c6c-0268-47ca-bab9-4a899391e74b",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "bdd7ff46-118c-44e7-9b2e-cd522a248a8a",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "311ea123-5b30-4637-ae39-3e639e780c83",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "messageChannel",
                                        "namePlural": "messageChannels",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "6cb4b092-b140-4f6c-97d6-0f7f7d3ae6f7",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "uuid",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "7d037a16-39b4-45ef-b06e-a8b99151d223",
                                "type": "UUID",
                                "name": "messageThreadId",
                                "label": "Message Thread Id id (foreign key)",
                                "description": "Message Thread Id id foreign key",
                                "icon": "IconHash",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "fcbef4a3-f1d9-4714-b7ea-f44816821d6e",
                                "type": "RELATION",
                                "name": "messageThread",
                                "label": "Message Thread Id",
                                "description": "Message Thread Id",
                                "icon": "IconHash",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "1d8cbabc-edf5-40c9-8bd5-d1e47a93d246",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0985d46f-722d-468f-9fa6-efa219405aa7",
                                        "nameSingular": "messageChannelMessageAssociation",
                                        "namePlural": "messageChannelMessageAssociations"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "fcbef4a3-f1d9-4714-b7ea-f44816821d6e",
                                        "name": "messageThread"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "1f73c3c3-a356-4a70-8a91-948e70120fdf",
                                        "nameSingular": "messageThread",
                                        "namePlural": "messageThreads"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "25bbf51f-17fa-4a2c-9636-3f3fdba41e08",
                                        "name": "messageChannelMessageAssociations"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "1d8cbabc-edf5-40c9-8bd5-d1e47a93d246",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "25bbf51f-17fa-4a2c-9636-3f3fdba41e08",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "1f73c3c3-a356-4a70-8a91-948e70120fdf",
                                        "dataSourceId": "8b919f4b-aef5-40ba-aeeb-3f29b90e765f",
                                        "nameSingular": "messageThread",
                                        "namePlural": "messageThreads",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                }
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "a00f2265-a78a-4b12-9367-e034da304ac6",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-08-02T16:00:05.938Z",
                                "updatedAt": "2024-08-02T16:00:05.938Z",
                                "defaultValue": "now",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        }
                    ]
                }
            }
        }
    ]
}
 
} as ObjectMetadataItemsQuery;

