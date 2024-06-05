import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import {
  FieldMetadataType,
  ObjectEdge,
  ObjectMetadataItemsQuery,
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
        "endCursor": "YXJyYXljb25uZWN0aW9uOjI4"
    },
    "edges": [
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "ead7b6ea-59e5-47c8-ac50-6b7e8df62b48",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "92212f36-abd9-4b54-ba41-b4fafedde8a2",
                                "type": "RELATION",
                                "name": "workspaceMember",
                                "label": "WorkspaceMember",
                                "description": "WorkspaceMember",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "91c623d1-5d99-4b4a-b32f-d79581bb7842",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "ead7b6ea-59e5-47c8-ac50-6b7e8df62b48",
                                        "nameSingular": "blocklist",
                                        "namePlural": "blocklists"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "92212f36-abd9-4b54-ba41-b4fafedde8a2",
                                        "name": "workspaceMember"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "b4dd981c-d5e5-4695-9d7d-e806abcabc01",
                                        "name": "blocklist"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "91c623d1-5d99-4b4a-b32f-d79581bb7842",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "b4dd981c-d5e5-4695-9d7d-e806abcabc01",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "76475b59-b68a-4f9b-850f-96ffa428ff2d",
                                "type": "TEXT",
                                "name": "handle",
                                "label": "Handle",
                                "description": "Handle",
                                "icon": "IconAt",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "6955b227-3a67-4694-b4c8-9dc1b24a9886",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "d40b0224-f8bc-4f44-b00b-89791e0a57fd",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "f73788bd-34b4-42c6-b299-45c9f3b0f346",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "46d608b9-1d29-4a5a-b082-5ce18cc5e79b",
                                "type": "UUID",
                                "name": "workspaceMemberId",
                                "label": "WorkspaceMember id (foreign key)",
                                "description": "WorkspaceMember id foreign key",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                "id": "e9ea869d-b7fd-46f3-8c0d-0518ad2a21ca",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "fb3001a8-4590-4c42-baab-31fb943361e1",
                                "type": "RELATION",
                                "name": "opportunity",
                                "label": "Opportunity",
                                "description": "ActivityTarget opportunity",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "d2fc32f9-b1ea-491f-bb1e-b10eeca69546",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e9ea869d-b7fd-46f3-8c0d-0518ad2a21ca",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "fb3001a8-4590-4c42-baab-31fb943361e1",
                                        "name": "opportunity"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "50fb71e4-ba3e-4c98-892e-5b11761e69cf",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "0b05c553-794b-4948-94c7-f2d4cdfdad2f",
                                        "name": "activityTargets"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "d2fc32f9-b1ea-491f-bb1e-b10eeca69546",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "0b05c553-794b-4948-94c7-f2d4cdfdad2f",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "50fb71e4-ba3e-4c98-892e-5b11761e69cf",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "06d677ee-bb64-4600-b9b3-65cd0f7ae64c",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "fca5bf7a-0505-4e54-a389-d965996bc88a",
                                "type": "UUID",
                                "name": "personId",
                                "label": "Person id (foreign key)",
                                "description": "ActivityTarget person id foreign key",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "97b1253e-6632-43a9-af95-7f8a1d0b334b",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "19186351-da7d-4250-be07-74e2924a839b",
                                "type": "RELATION",
                                "name": "activity",
                                "label": "Activity",
                                "description": "ActivityTarget activity",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "66ed4f9f-1089-4be9-82b3-6a2de206ea51",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e9ea869d-b7fd-46f3-8c0d-0518ad2a21ca",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "19186351-da7d-4250-be07-74e2924a839b",
                                        "name": "activity"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c9a281d4-f7a1-4a59-89c4-80f7184904d3",
                                        "nameSingular": "activity",
                                        "namePlural": "activities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "6e6f5fd4-557f-47f0-8430-8a9bf646023b",
                                        "name": "activityTargets"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "66ed4f9f-1089-4be9-82b3-6a2de206ea51",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "6e6f5fd4-557f-47f0-8430-8a9bf646023b",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c9a281d4-f7a1-4a59-89c4-80f7184904d3",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "5bc29d63-1de7-4ecd-90bd-672970e96e9c",
                                "type": "RELATION",
                                "name": "company",
                                "label": "Company",
                                "description": "ActivityTarget company",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "36d7bf30-3139-40e6-9d9c-8b0c06e95955",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e9ea869d-b7fd-46f3-8c0d-0518ad2a21ca",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5bc29d63-1de7-4ecd-90bd-672970e96e9c",
                                        "name": "company"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5f3026e0-a199-44e7-b5d6-e3db935ed063",
                                        "name": "activityTargets"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "36d7bf30-3139-40e6-9d9c-8b0c06e95955",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "5f3026e0-a199-44e7-b5d6-e3db935ed063",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "38c19ed3-ead8-4a39-8ebc-e3320b180491",
                                "type": "UUID",
                                "name": "activityId",
                                "label": "Activity id (foreign key)",
                                "description": "ActivityTarget activity id foreign key",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "b2f6d101-0276-42b6-a963-63d77d4d8b85",
                                "type": "UUID",
                                "name": "companyId",
                                "label": "Company id (foreign key)",
                                "description": "ActivityTarget company id foreign key",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "60984ddf-f200-47d3-a07d-d0d6ecc08016",
                                "type": "RELATION",
                                "name": "person",
                                "label": "Person",
                                "description": "ActivityTarget person",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "f3705dff-02ba-4ed9-8540-4c6c8303e602",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e9ea869d-b7fd-46f3-8c0d-0518ad2a21ca",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "60984ddf-f200-47d3-a07d-d0d6ecc08016",
                                        "name": "person"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "76646362-c3d1-4dcf-a145-a4f4bae9946a",
                                        "name": "activityTargets"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "f3705dff-02ba-4ed9-8540-4c6c8303e602",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "76646362-c3d1-4dcf-a145-a4f4bae9946a",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "4f92cd22-6bf1-41ee-8a31-3225e83f9152",
                                "type": "UUID",
                                "name": "opportunityId",
                                "label": "Opportunity id (foreign key)",
                                "description": "ActivityTarget opportunity id foreign key",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "194809f6-6052-452e-b8e3-4ce8104bef35",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                "id": "e881ed81-8683-478a-95fa-8eb430056d42",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "8fd2e2ad-be8f-4ea2-adb8-6599e88cefec",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "e1e88a22-3bdc-484a-af11-0bc7fbb604c4",
                                "type": "TEXT",
                                "name": "type",
                                "label": "Type",
                                "description": "View type",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "38988276-7a81-4711-a0fc-e9d34d5407ab",
                                "type": "UUID",
                                "name": "objectMetadataId",
                                "label": "Object Metadata Id",
                                "description": "View target object",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "8e6fab04-a50c-4393-b1d8-5ba92b6ee97d",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "67bb8a42-7278-417c-9575-cd6c0beccd7f",
                                "type": "TEXT",
                                "name": "name",
                                "label": "Name",
                                "description": "View name",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "2932c2e4-dd2f-4187-9935-e09826db5fdd",
                                "type": "RELATION",
                                "name": "viewFields",
                                "label": "View Fields",
                                "description": "View Fields",
                                "icon": "IconTag",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "7a54da00-dcf4-4efa-8f1a-c1fd68bff8d1",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e881ed81-8683-478a-95fa-8eb430056d42",
                                        "nameSingular": "view",
                                        "namePlural": "views"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "2932c2e4-dd2f-4187-9935-e09826db5fdd",
                                        "name": "viewFields"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "5473e152-fe49-477c-aab6-f1b4a042a8bf",
                                        "nameSingular": "viewField",
                                        "namePlural": "viewFields"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "e0586b12-ebf1-4e91-a19c-678bcd158896",
                                        "name": "view"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "7a54da00-dcf4-4efa-8f1a-c1fd68bff8d1",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "e0586b12-ebf1-4e91-a19c-678bcd158896",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "5473e152-fe49-477c-aab6-f1b4a042a8bf",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "viewField",
                                        "namePlural": "viewFields",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "2c06c90a-090f-4579-92f1-b0e8b4698404",
                                "type": "TEXT",
                                "name": "kanbanFieldMetadataId",
                                "label": "kanbanfieldMetadataId",
                                "description": "View Kanban column field",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "4066d5c6-f7ed-4a73-854a-e9d520e56ff7",
                                "type": "POSITION",
                                "name": "position",
                                "label": "Position",
                                "description": "View position",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "cd39745c-72df-443c-bccc-dd94523b7764",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "3966e7a7-1471-4a79-bb38-56eedfd15e96",
                                "type": "BOOLEAN",
                                "name": "isCompact",
                                "label": "Compact View",
                                "description": "Describes if the view is in compact mode",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "8f680bc3-91cf-42c2-b7f7-44943af6a223",
                                "type": "RELATION",
                                "name": "viewFilters",
                                "label": "View Filters",
                                "description": "View Filters",
                                "icon": "IconFilterBolt",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "c94f1341-3cd1-43d8-9262-ad316fb59c10",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e881ed81-8683-478a-95fa-8eb430056d42",
                                        "nameSingular": "view",
                                        "namePlural": "views"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "8f680bc3-91cf-42c2-b7f7-44943af6a223",
                                        "name": "viewFilters"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "21d73f78-51c8-4fb8-8433-6114c9e671d0",
                                        "nameSingular": "viewFilter",
                                        "namePlural": "viewFilters"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "8a38cee5-64d0-4db6-b7e0-8377161bc2b3",
                                        "name": "view"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "c94f1341-3cd1-43d8-9262-ad316fb59c10",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "8a38cee5-64d0-4db6-b7e0-8377161bc2b3",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "21d73f78-51c8-4fb8-8433-6114c9e671d0",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "viewFilter",
                                        "namePlural": "viewFilters",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "4976b932-7da6-451a-8cc0-04d32143e097",
                                "type": "TEXT",
                                "name": "icon",
                                "label": "Icon",
                                "description": "View icon",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "b9a8c390-347e-4be3-9751-728d94056914",
                                "type": "RELATION",
                                "name": "viewSorts",
                                "label": "View Sorts",
                                "description": "View Sorts",
                                "icon": "IconArrowsSort",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "9a3eb83a-a90c-489a-b61f-059e25366a67",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e881ed81-8683-478a-95fa-8eb430056d42",
                                        "nameSingular": "view",
                                        "namePlural": "views"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "b9a8c390-347e-4be3-9751-728d94056914",
                                        "name": "viewSorts"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "00927c95-d590-4f85-b05b-1c7ac61ea6c6",
                                        "nameSingular": "viewSort",
                                        "namePlural": "viewSorts"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "62603029-8195-4945-a178-708e6056696c",
                                        "name": "view"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "9a3eb83a-a90c-489a-b61f-059e25366a67",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "62603029-8195-4945-a178-708e6056696c",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "00927c95-d590-4f85-b05b-1c7ac61ea6c6",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "viewSort",
                                        "namePlural": "viewSorts",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "731bc121-e302-41cc-b40c-f6acb21a6d70",
                                "type": "SELECT",
                                "name": "key",
                                "label": "Key",
                                "description": "View key",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": "'INDEX'",
                                "options": [
                                    {
                                        "id": "52f0fb0c-5ede-40a8-b51b-94612ae04ac0",
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
                        }
                    ]
                }
            }
        },
        {
            "__typename": "objectEdge",
            "node": {
                "__typename": "object",
                "id": "dcc47dfd-6e83-468c-ab20-c4db02ba0cf4",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "57e22ced-bae3-4a28-9738-feb07a71d680",
                                "type": "RELATION",
                                "name": "messageChannelMessageAssociations",
                                "label": "Message Channel Association",
                                "description": "Messages from the channel.",
                                "icon": "IconMessage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "99cfc7c7-4e29-4555-b1cf-07e3ca674ebc",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dcc47dfd-6e83-468c-ab20-c4db02ba0cf4",
                                        "nameSingular": "messageChannel",
                                        "namePlural": "messageChannels"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "57e22ced-bae3-4a28-9738-feb07a71d680",
                                        "name": "messageChannelMessageAssociations"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "83c58624-5f4b-4904-828f-c0d75a64470a",
                                        "nameSingular": "messageChannelMessageAssociation",
                                        "namePlural": "messageChannelMessageAssociations"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "9ff0f228-144c-4a06-b924-6208c98b7be2",
                                        "name": "messageChannel"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "99cfc7c7-4e29-4555-b1cf-07e3ca674ebc",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "9ff0f228-144c-4a06-b924-6208c98b7be2",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "83c58624-5f4b-4904-828f-c0d75a64470a",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "messageChannelMessageAssociation",
                                        "namePlural": "messageChannelMessageAssociations",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "6b046e71-d326-4012-9d83-59ae70b55e9e",
                                "type": "RELATION",
                                "name": "connectedAccount",
                                "label": "Connected Account",
                                "description": "Connected Account",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "ae1e0173-b7dd-4b2f-9ef1-4010ad2309b3",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dcc47dfd-6e83-468c-ab20-c4db02ba0cf4",
                                        "nameSingular": "messageChannel",
                                        "namePlural": "messageChannels"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "6b046e71-d326-4012-9d83-59ae70b55e9e",
                                        "name": "connectedAccount"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "9a5b559e-86ab-4189-8edd-8f8c6b6cd474",
                                        "nameSingular": "connectedAccount",
                                        "namePlural": "connectedAccounts"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "e4fe7458-5c73-45aa-a1c4-fb10263f7c72",
                                        "name": "messageChannels"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "ae1e0173-b7dd-4b2f-9ef1-4010ad2309b3",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "e4fe7458-5c73-45aa-a1c4-fb10263f7c72",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "9a5b559e-86ab-4189-8edd-8f8c6b6cd474",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "4a450753-ed41-4dbc-ae5c-0ae92befffa8",
                                "type": "SELECT",
                                "name": "syncSubStatus",
                                "label": "Sync sub status",
                                "description": "Sync sub status",
                                "icon": "IconStatusChange",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": "'FULL_MESSAGE_LIST_FETCH_PENDING'",
                                "options": [
                                    {
                                        "id": "24fe8ce2-2bbf-4aa4-ab11-ed37d0b94aa2",
                                        "color": "blue",
                                        "label": "Full messages list fetch pending",
                                        "value": "FULL_MESSAGE_LIST_FETCH_PENDING",
                                        "position": 0
                                    },
                                    {
                                        "id": "04bc2d01-66a7-497c-8732-e4e2dfb5f6c6",
                                        "color": "blue",
                                        "label": "Partial messages list fetch pending",
                                        "value": "PARTIAL_MESSAGE_LIST_FETCH_PENDING",
                                        "position": 1
                                    },
                                    {
                                        "id": "00ac2ea1-1fca-41ae-8bf6-2f4ef3839670",
                                        "color": "orange",
                                        "label": "Messages list fetch ongoing",
                                        "value": "MESSAGE_LIST_FETCH_ONGOING",
                                        "position": 2
                                    },
                                    {
                                        "id": "27a0d807-37d3-4905-b258-a649aaa6a90b",
                                        "color": "blue",
                                        "label": "Messages import pending",
                                        "value": "MESSAGES_IMPORT_PENDING",
                                        "position": 3
                                    },
                                    {
                                        "id": "a02fbabb-359a-4136-8ed4-f6d86a18b7f3",
                                        "color": "orange",
                                        "label": "Messages import ongoing",
                                        "value": "MESSAGES_IMPORT_ONGOING",
                                        "position": 4
                                    },
                                    {
                                        "id": "f7ce092f-5c82-4397-8b9c-238ba170bdf5",
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
                                "id": "d6bdf24a-7014-4996-9b30-399b35155b2a",
                                "type": "SELECT",
                                "name": "type",
                                "label": "Type",
                                "description": "Channel Type",
                                "icon": "IconMessage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": "'email'",
                                "options": [
                                    {
                                        "id": "554405c6-813e-4211-9164-171f6687039d",
                                        "color": "green",
                                        "label": "Email",
                                        "value": "email",
                                        "position": 0
                                    },
                                    {
                                        "id": "277bb506-7996-46c7-9094-aef448869585",
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
                                "id": "bdb776b6-58d9-4568-95f1-f22b4b76315a",
                                "type": "NUMBER",
                                "name": "throttleFailureCount",
                                "label": "Throttle Failure Count",
                                "description": "Throttle Failure Count",
                                "icon": "IconX",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "0ab1fa82-994d-4326-9ea5-b238e109d0d0",
                                "type": "DATE_TIME",
                                "name": "ongoingSyncStartedAt",
                                "label": "Ongoing sync started at",
                                "description": "Ongoing sync started at",
                                "icon": "IconHistory",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "b1647fd1-c29f-4a48-8d7d-034f559bc2a4",
                                "type": "SELECT",
                                "name": "syncStatus",
                                "label": "Sync status",
                                "description": "Sync status",
                                "icon": "IconStatusChange",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": [
                                    {
                                        "id": "95850d46-47e1-4003-bc87-f090cf60cf3f",
                                        "color": "blue",
                                        "label": "Pending",
                                        "value": "PENDING",
                                        "position": 0
                                    },
                                    {
                                        "id": "438e697f-14d7-417b-bdec-d5596eca2500",
                                        "color": "green",
                                        "label": "Succeeded",
                                        "value": "SUCCEEDED",
                                        "position": 2
                                    },
                                    {
                                        "id": "3193b076-3030-4bd7-abdb-80d7a3329511",
                                        "color": "red",
                                        "label": "Failed",
                                        "value": "FAILED",
                                        "position": 3
                                    },
                                    {
                                        "id": "4d9d9214-b318-4cf0-a807-28b411a37241",
                                        "color": "yellow",
                                        "label": "Ongoing",
                                        "value": "ONGOING",
                                        "position": 1
                                    },
                                    {
                                        "id": "45c1682b-fbc3-4492-bdf8-c34d4a66f691",
                                        "color": "blue",
                                        "label": "Not Synced",
                                        "value": "NOT_SYNCED",
                                        "position": 4
                                    },
                                    {
                                        "id": "03641828-d293-41b6-b7f0-8805e4f19040",
                                        "color": "green",
                                        "label": "Completed",
                                        "value": "COMPLETED",
                                        "position": 5
                                    },
                                    {
                                        "id": "d296b5bf-2090-49ae-b983-3d74d7325c9a",
                                        "color": "red",
                                        "label": "Failed Insufficient Permissions",
                                        "value": "FAILED_INSUFFICIENT_PERMISSIONS",
                                        "position": 6
                                    },
                                    {
                                        "id": "6311e060-85db-4bae-ac8b-e7db0c899719",
                                        "color": "red",
                                        "label": "Failed Unknown",
                                        "value": "FAILED_UNKNOWN",
                                        "position": 7
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
                                "id": "8b93f921-abe9-46f1-9299-a4fcf2138265",
                                "type": "TEXT",
                                "name": "handle",
                                "label": "Handle",
                                "description": "Handle",
                                "icon": "IconAt",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "77a81793-64c5-4272-a6d7-a77fc3657642",
                                "type": "SELECT",
                                "name": "visibility",
                                "label": "Visibility",
                                "description": "Visibility",
                                "icon": "IconEyeglass",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": "'share_everything'",
                                "options": [
                                    {
                                        "id": "a3be227d-26ef-460b-bd7f-a37eb32958b2",
                                        "color": "green",
                                        "label": "Metadata",
                                        "value": "metadata",
                                        "position": 0
                                    },
                                    {
                                        "id": "b680051f-44db-4e0e-99ff-25d088962548",
                                        "color": "blue",
                                        "label": "Subject",
                                        "value": "subject",
                                        "position": 1
                                    },
                                    {
                                        "id": "1505ef30-9ded-4331-9fd5-97edadf8fa33",
                                        "color": "orange",
                                        "label": "Share Everything",
                                        "value": "share_everything",
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
                                "id": "e3223f09-a6bb-4888-b5ad-6c3e9c2e8e0c",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "410f2e80-c5b1-458d-9a43-2fe806b9bcc1",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "3ce67ec5-0862-46e1-aa6a-c8d83be6a7fe",
                                "type": "TEXT",
                                "name": "syncCursor",
                                "label": "Last sync cursor",
                                "description": "Last sync cursor",
                                "icon": "IconHistory",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "4940801a-7f32-4765-afce-87428d5e6588",
                                "type": "DATE_TIME",
                                "name": "throttlePauseUntil",
                                "label": "Throttle Pause Until",
                                "description": "Throttle Pause Until",
                                "icon": "IconPlayerPause",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "79279bbe-7f74-44d2-92c5-f44f4eb25ce7",
                                "type": "BOOLEAN",
                                "name": "isContactAutoCreationEnabled",
                                "label": "Is Contact Auto Creation Enabled",
                                "description": "Is Contact Auto Creation Enabled",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "ccbcd336-02ab-47d8-aa18-8e47d234f331",
                                "type": "DATE_TIME",
                                "name": "syncedAt",
                                "label": "Last sync date",
                                "description": "Last sync date",
                                "icon": "IconHistory",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "eeec73ba-6e55-4e85-b50c-68624a3b3585",
                                "type": "BOOLEAN",
                                "name": "isSyncEnabled",
                                "label": "Is Sync Enabled",
                                "description": "Is Sync Enabled",
                                "icon": "IconRefresh",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "ed509fe5-5f53-4131-b41a-560d55563495",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "2d0fca24-5310-4a30-9499-d7b657bcb482",
                                "type": "UUID",
                                "name": "connectedAccountId",
                                "label": "Connected Account id (foreign key)",
                                "description": "Connected Account id foreign key",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                "id": "cef36472-b79e-45bc-aff0-60157b9807db",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "316bfc58-4813-419c-85aa-1bd96cdb6d9b",
                                "type": "RELATION",
                                "name": "calendarEvent",
                                "label": "Event ID",
                                "description": "Event ID",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "a335bc90-4bc0-4aa2-b7b3-191b7d30e823",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "cef36472-b79e-45bc-aff0-60157b9807db",
                                        "nameSingular": "calendarEventParticipant",
                                        "namePlural": "calendarEventParticipants"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "316bfc58-4813-419c-85aa-1bd96cdb6d9b",
                                        "name": "calendarEvent"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "79f50dfc-f163-497b-8662-79a83ab81b31",
                                        "nameSingular": "calendarEvent",
                                        "namePlural": "calendarEvents"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5dcf82b8-1acb-4a09-80a9-3ab3b6edad1d",
                                        "name": "calendarEventParticipants"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "a335bc90-4bc0-4aa2-b7b3-191b7d30e823",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "5dcf82b8-1acb-4a09-80a9-3ab3b6edad1d",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "79f50dfc-f163-497b-8662-79a83ab81b31",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "4526b185-39b7-44d0-a2d6-5498db49f496",
                                "type": "SELECT",
                                "name": "responseStatus",
                                "label": "Response Status",
                                "description": "Response Status",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": "'NEEDS_ACTION'",
                                "options": [
                                    {
                                        "id": "7b563541-86b1-4b17-bd7f-b46728b666e3",
                                        "color": "orange",
                                        "label": "Needs Action",
                                        "value": "NEEDS_ACTION",
                                        "position": 0
                                    },
                                    {
                                        "id": "3ab83ed7-0eaa-4888-94df-33573e4af5eb",
                                        "color": "red",
                                        "label": "Declined",
                                        "value": "DECLINED",
                                        "position": 1
                                    },
                                    {
                                        "id": "732bacd4-c87b-4b41-9b33-ff79d98a30e7",
                                        "color": "yellow",
                                        "label": "Tentative",
                                        "value": "TENTATIVE",
                                        "position": 2
                                    },
                                    {
                                        "id": "b7036eb0-d919-4bca-bfa6-600df59dae93",
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
                                "id": "27bbcb60-9c1d-4899-9796-ffaf6e9b7c81",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "3808becb-130e-46af-91d5-c3389988c74e",
                                "type": "TEXT",
                                "name": "handle",
                                "label": "Handle",
                                "description": "Handle",
                                "icon": "IconMail",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "6b75fdc6-9504-4b49-af9f-07615f53912e",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "ed19053d-8e5c-42ee-8647-dd98f68f02ef",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "1c527edc-616e-4610-9a55-5a7002fc3a17",
                                "type": "RELATION",
                                "name": "person",
                                "label": "Person",
                                "description": "Person",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "84ba4869-673e-45ac-8e25-e58dbf28d34d",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "cef36472-b79e-45bc-aff0-60157b9807db",
                                        "nameSingular": "calendarEventParticipant",
                                        "namePlural": "calendarEventParticipants"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "1c527edc-616e-4610-9a55-5a7002fc3a17",
                                        "name": "person"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "10c247e2-3119-4a03-870a-c141cc6d622a",
                                        "name": "calendarEventParticipants"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "84ba4869-673e-45ac-8e25-e58dbf28d34d",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "10c247e2-3119-4a03-870a-c141cc6d622a",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "3a509c9e-1174-443a-bb5a-0ebedc70010f",
                                "type": "UUID",
                                "name": "personId",
                                "label": "Person id (foreign key)",
                                "description": "Person id foreign key",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "d4d4dc14-b704-4c6c-b820-ce2a9f8a7029",
                                "type": "RELATION",
                                "name": "workspaceMember",
                                "label": "Workspace Member",
                                "description": "Workspace Member",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "1d580380-b783-45cb-ac7d-f2ddc2595176",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "cef36472-b79e-45bc-aff0-60157b9807db",
                                        "nameSingular": "calendarEventParticipant",
                                        "namePlural": "calendarEventParticipants"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "d4d4dc14-b704-4c6c-b820-ce2a9f8a7029",
                                        "name": "workspaceMember"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "f0176ccd-9361-4c73-a39e-c872fb851e4d",
                                        "name": "calendarEventParticipants"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "1d580380-b783-45cb-ac7d-f2ddc2595176",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "f0176ccd-9361-4c73-a39e-c872fb851e4d",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "9f75475b-c652-48ef-990d-abfe1277f454",
                                "type": "BOOLEAN",
                                "name": "isOrganizer",
                                "label": "Is Organizer",
                                "description": "Is Organizer",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "62f3eb52-8122-482c-86ac-7c6cfa844a23",
                                "type": "TEXT",
                                "name": "displayName",
                                "label": "Display Name",
                                "description": "Display Name",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "d372c1b8-77e0-40d6-a041-4ebe11142a5f",
                                "type": "UUID",
                                "name": "workspaceMemberId",
                                "label": "Workspace Member id (foreign key)",
                                "description": "Workspace Member id foreign key",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "e3ac21a7-d4c8-448e-96b9-16c83db34157",
                                "type": "UUID",
                                "name": "calendarEventId",
                                "label": "Event ID id (foreign key)",
                                "description": "Event ID id foreign key",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                "id": "c9a281d4-f7a1-4a59-89c4-80f7184904d3",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "3cc75e47-4478-47ca-a32c-827b04d763ab",
                                "type": "TEXT",
                                "name": "type",
                                "label": "Type",
                                "description": "Activity type",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "3a8b22a7-5b28-45b4-a6af-9feedcb0acf9",
                                "type": "TEXT",
                                "name": "body",
                                "label": "Body",
                                "description": "Activity body",
                                "icon": "IconList",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "338a3301-7e52-40b3-894d-f40e3a96cb41",
                                "type": "RELATION",
                                "name": "comments",
                                "label": "Comments",
                                "description": "Activity comments",
                                "icon": "IconComment",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "2149ba9d-ffb6-47e5-b651-214b1846ff94",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c9a281d4-f7a1-4a59-89c4-80f7184904d3",
                                        "nameSingular": "activity",
                                        "namePlural": "activities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "338a3301-7e52-40b3-894d-f40e3a96cb41",
                                        "name": "comments"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c400eb95-369e-49ff-8b3e-920fd561bc39",
                                        "nameSingular": "comment",
                                        "namePlural": "comments"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "c89d401f-499c-45cd-ac8d-e90731be991f",
                                        "name": "activity"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "2149ba9d-ffb6-47e5-b651-214b1846ff94",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "c89d401f-499c-45cd-ac8d-e90731be991f",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c400eb95-369e-49ff-8b3e-920fd561bc39",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "comment",
                                        "namePlural": "comments",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "1eaea43e-3841-49b4-8063-d2c73f918e90",
                                "type": "RELATION",
                                "name": "attachments",
                                "label": "Attachments",
                                "description": "Activity attachments",
                                "icon": "IconFileImport",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "7b85a077-9552-4c4e-9dca-49fcc139c02f",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c9a281d4-f7a1-4a59-89c4-80f7184904d3",
                                        "nameSingular": "activity",
                                        "namePlural": "activities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "1eaea43e-3841-49b4-8063-d2c73f918e90",
                                        "name": "attachments"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0ab14e53-605a-4863-8af4-78a5c54fd603",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "9c55aa06-da6e-47ff-b447-3ef376cd98d5",
                                        "name": "activity"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "7b85a077-9552-4c4e-9dca-49fcc139c02f",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "9c55aa06-da6e-47ff-b447-3ef376cd98d5",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0ab14e53-605a-4863-8af4-78a5c54fd603",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "6e6f5fd4-557f-47f0-8430-8a9bf646023b",
                                "type": "RELATION",
                                "name": "activityTargets",
                                "label": "Targets",
                                "description": "Activity targets",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "66ed4f9f-1089-4be9-82b3-6a2de206ea51",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c9a281d4-f7a1-4a59-89c4-80f7184904d3",
                                        "nameSingular": "activity",
                                        "namePlural": "activities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "6e6f5fd4-557f-47f0-8430-8a9bf646023b",
                                        "name": "activityTargets"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e9ea869d-b7fd-46f3-8c0d-0518ad2a21ca",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "19186351-da7d-4250-be07-74e2924a839b",
                                        "name": "activity"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "66ed4f9f-1089-4be9-82b3-6a2de206ea51",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "19186351-da7d-4250-be07-74e2924a839b",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e9ea869d-b7fd-46f3-8c0d-0518ad2a21ca",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "1b1125d4-78c6-4ac3-92c4-4a75e19c02cd",
                                "type": "DATE_TIME",
                                "name": "dueAt",
                                "label": "Due Date",
                                "description": "Activity due date",
                                "icon": "IconCalendarEvent",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "2113bbdc-db33-47ae-b46b-10aa4acec71b",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "8d88cf4b-bdda-4ddc-8fc0-72d61db46d94",
                                "type": "UUID",
                                "name": "assigneeId",
                                "label": "Assignee id (foreign key)",
                                "description": "Activity assignee id foreign key",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "5b49f674-012b-468a-a3ba-b7f7f46f39e6",
                                "type": "RELATION",
                                "name": "author",
                                "label": "Author",
                                "description": "Activity author",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "457d63d3-63c3-4658-a2f8-5efd6d1ce6af",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c9a281d4-f7a1-4a59-89c4-80f7184904d3",
                                        "nameSingular": "activity",
                                        "namePlural": "activities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5b49f674-012b-468a-a3ba-b7f7f46f39e6",
                                        "name": "author"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "10e23df6-55ba-4397-bab1-ad70f2f7ceab",
                                        "name": "authoredActivities"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "457d63d3-63c3-4658-a2f8-5efd6d1ce6af",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "10e23df6-55ba-4397-bab1-ad70f2f7ceab",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "91f65fb6-a8c6-42a8-90ba-2e9f20cd3408",
                                "type": "DATE_TIME",
                                "name": "completedAt",
                                "label": "Completion Date",
                                "description": "Activity completion date",
                                "icon": "IconCheck",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "0671fec4-419f-4d1a-802e-db59b3ef634d",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "378757f3-6e03-4604-a70e-7283fc1795a7",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "e1be7991-b8b0-4779-aa01-c6c7bbf0b0cd",
                                "type": "UUID",
                                "name": "authorId",
                                "label": "Author id (foreign key)",
                                "description": "Activity author id foreign key",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "df850213-b9d1-476d-88db-33be749b0d04",
                                "type": "TEXT",
                                "name": "title",
                                "label": "Title",
                                "description": "Activity title",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "80874265-d3b4-4890-8981-b081e4c22a7c",
                                "type": "DATE_TIME",
                                "name": "reminderAt",
                                "label": "Reminder Date",
                                "description": "Activity reminder date",
                                "icon": "IconCalendarEvent",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "f7807f8d-790b-4742-8bfd-b7a9d385c26b",
                                "type": "RELATION",
                                "name": "assignee",
                                "label": "Assignee",
                                "description": "Activity assignee",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "92229a2f-b5bc-4f0c-a1f7-d45ce6a79a3d",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c9a281d4-f7a1-4a59-89c4-80f7184904d3",
                                        "nameSingular": "activity",
                                        "namePlural": "activities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "f7807f8d-790b-4742-8bfd-b7a9d385c26b",
                                        "name": "assignee"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "b326f05c-ea3c-4f7c-8077-16b5266c33ca",
                                        "name": "assignedActivities"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "92229a2f-b5bc-4f0c-a1f7-d45ce6a79a3d",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "b326f05c-ea3c-4f7c-8077-16b5266c33ca",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers",
                                        "isSystem": true,
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
                "id": "c400eb95-369e-49ff-8b3e-920fd561bc39",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "f420fe07-bced-4c2c-9502-6b777b991f30",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "619abf44-4ed1-4cdd-806b-2acd3536a58e",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "c89d401f-499c-45cd-ac8d-e90731be991f",
                                "type": "RELATION",
                                "name": "activity",
                                "label": "Activity",
                                "description": "Comment activity",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "2149ba9d-ffb6-47e5-b651-214b1846ff94",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c400eb95-369e-49ff-8b3e-920fd561bc39",
                                        "nameSingular": "comment",
                                        "namePlural": "comments"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "c89d401f-499c-45cd-ac8d-e90731be991f",
                                        "name": "activity"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c9a281d4-f7a1-4a59-89c4-80f7184904d3",
                                        "nameSingular": "activity",
                                        "namePlural": "activities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "338a3301-7e52-40b3-894d-f40e3a96cb41",
                                        "name": "comments"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "2149ba9d-ffb6-47e5-b651-214b1846ff94",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "338a3301-7e52-40b3-894d-f40e3a96cb41",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c9a281d4-f7a1-4a59-89c4-80f7184904d3",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "7d44d86e-2960-41bb-a2c8-312b1a25318e",
                                "type": "UUID",
                                "name": "activityId",
                                "label": "Activity id (foreign key)",
                                "description": "Comment activity id foreign key",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "793d6826-0430-4b06-90f1-0f675001e71a",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "e99feb84-b505-4dc6-a4bc-5367302a1d2e",
                                "type": "TEXT",
                                "name": "body",
                                "label": "Body",
                                "description": "Comment body",
                                "icon": "IconLink",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "ba345148-7345-4a90-8d3f-e32b3bd0f45d",
                                "type": "UUID",
                                "name": "authorId",
                                "label": "Author id (foreign key)",
                                "description": "Comment author id foreign key",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "2f867595-dc61-4ec2-b34c-5a07d6329ae7",
                                "type": "RELATION",
                                "name": "author",
                                "label": "Author",
                                "description": "Comment author",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "f67757f3-c57b-4edf-9ce0-8f7bf93cdaca",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c400eb95-369e-49ff-8b3e-920fd561bc39",
                                        "nameSingular": "comment",
                                        "namePlural": "comments"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "2f867595-dc61-4ec2-b34c-5a07d6329ae7",
                                        "name": "author"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "d429871c-08ba-4b6e-bb12-4bcd5e6b5b52",
                                        "name": "authoredComments"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "f67757f3-c57b-4edf-9ce0-8f7bf93cdaca",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "d429871c-08ba-4b6e-bb12-4bcd5e6b5b52",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers",
                                        "isSystem": true,
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
                "id": "bcda7a99-9b9e-4fec-9ed6-ef880da81cf1",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "224b0665-2115-4a53-92e4-8f8d52986fd1",
                                "type": "TEXT",
                                "name": "displayName",
                                "label": "Display Name",
                                "description": "Display Name",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "cc03cc30-28bb-4791-9814-398675b84f61",
                                "type": "TEXT",
                                "name": "handle",
                                "label": "Handle",
                                "description": "Handle",
                                "icon": "IconAt",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "ae7488d5-54c1-47cd-b5af-695884679a15",
                                "type": "UUID",
                                "name": "personId",
                                "label": "Person id (foreign key)",
                                "description": "Person id foreign key",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "c7f260a3-8dbc-423e-b06b-d3ab752c821c",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "5d215350-5fb8-47e1-ac62-4f927d3d5a02",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "325bdf0a-ece5-4b45-aba3-fc06720e634c",
                                "type": "UUID",
                                "name": "messageId",
                                "label": "Message id (foreign key)",
                                "description": "Message id foreign key",
                                "icon": "IconMessage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "bda5f8cc-0b91-453d-ae37-156093d16690",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "e7e4dd30-93ac-47a2-9a98-4acddaffacda",
                                "type": "RELATION",
                                "name": "workspaceMember",
                                "label": "Workspace Member",
                                "description": "Workspace member",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "8a482cc2-bf97-4707-978f-21b8fd10a1d4",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "bcda7a99-9b9e-4fec-9ed6-ef880da81cf1",
                                        "nameSingular": "messageParticipant",
                                        "namePlural": "messageParticipants"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "e7e4dd30-93ac-47a2-9a98-4acddaffacda",
                                        "name": "workspaceMember"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "2a9fe753-08bb-489a-ac6b-60f896f32ef8",
                                        "name": "messageParticipants"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "8a482cc2-bf97-4707-978f-21b8fd10a1d4",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "2a9fe753-08bb-489a-ac6b-60f896f32ef8",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "8598bac4-8022-4f26-8d91-ab96f4f19276",
                                "type": "SELECT",
                                "name": "role",
                                "label": "Role",
                                "description": "Role",
                                "icon": "IconAt",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": "'from'",
                                "options": [
                                    {
                                        "id": "f345b8e8-a93a-4194-bb8e-f2326fbea438",
                                        "color": "green",
                                        "label": "From",
                                        "value": "from",
                                        "position": 0
                                    },
                                    {
                                        "id": "15694fa2-6cd7-4595-bbc6-5e7d16b4f968",
                                        "color": "blue",
                                        "label": "To",
                                        "value": "to",
                                        "position": 1
                                    },
                                    {
                                        "id": "62815af1-7c91-4e87-bc89-f9690b1093d2",
                                        "color": "orange",
                                        "label": "Cc",
                                        "value": "cc",
                                        "position": 2
                                    },
                                    {
                                        "id": "8edf9d01-3c52-4bc4-8b8a-f4131d0043f6",
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
                                "id": "20187a82-3501-41de-82af-b33c1469b00e",
                                "type": "UUID",
                                "name": "workspaceMemberId",
                                "label": "Workspace Member id (foreign key)",
                                "description": "Workspace member id foreign key",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "87b3b019-e6e7-42d9-a89a-bbf4a007f7fc",
                                "type": "RELATION",
                                "name": "message",
                                "label": "Message",
                                "description": "Message",
                                "icon": "IconMessage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "699b7574-6a7f-4b86-869d-931e8efc2dd7",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "bcda7a99-9b9e-4fec-9ed6-ef880da81cf1",
                                        "nameSingular": "messageParticipant",
                                        "namePlural": "messageParticipants"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "87b3b019-e6e7-42d9-a89a-bbf4a007f7fc",
                                        "name": "message"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "9189bf90-ba43-4c13-a10b-80936e1aae51",
                                        "nameSingular": "message",
                                        "namePlural": "messages"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "e8846f02-bd9b-492b-b004-11772ec9f358",
                                        "name": "messageParticipants"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "699b7574-6a7f-4b86-869d-931e8efc2dd7",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "e8846f02-bd9b-492b-b004-11772ec9f358",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "9189bf90-ba43-4c13-a10b-80936e1aae51",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "91e9b2dd-4d52-4322-b070-45cfea0e4388",
                                "type": "RELATION",
                                "name": "person",
                                "label": "Person",
                                "description": "Person",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "3049dfc2-3d3b-45b6-b463-d916fcf7f1dd",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "bcda7a99-9b9e-4fec-9ed6-ef880da81cf1",
                                        "nameSingular": "messageParticipant",
                                        "namePlural": "messageParticipants"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "91e9b2dd-4d52-4322-b070-45cfea0e4388",
                                        "name": "person"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5370f756-a239-4bad-aa12-bc2f2d6a8295",
                                        "name": "messageParticipants"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "3049dfc2-3d3b-45b6-b463-d916fcf7f1dd",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "5370f756-a239-4bad-aa12-bc2f2d6a8295",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "person",
                                        "namePlural": "people",
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
                "id": "b90048e2-39af-4fa7-a9b6-e5d12e5e04a4",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "cb8d77ef-a7f9-4087-8103-fd70d3cb9cdf",
                                "type": "RELATION",
                                "name": "messageChannelMessageAssociations",
                                "label": "Message Channel Association",
                                "description": "Messages from the channel",
                                "icon": "IconMessage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "46c93e08-e73c-4383-a582-b5eacabb0b29",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b90048e2-39af-4fa7-a9b6-e5d12e5e04a4",
                                        "nameSingular": "messageThread",
                                        "namePlural": "messageThreads"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "cb8d77ef-a7f9-4087-8103-fd70d3cb9cdf",
                                        "name": "messageChannelMessageAssociations"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "83c58624-5f4b-4904-828f-c0d75a64470a",
                                        "nameSingular": "messageChannelMessageAssociation",
                                        "namePlural": "messageChannelMessageAssociations"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "f3ba90e8-2c41-49f9-9489-907d352fd2ed",
                                        "name": "messageThread"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "46c93e08-e73c-4383-a582-b5eacabb0b29",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "f3ba90e8-2c41-49f9-9489-907d352fd2ed",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "83c58624-5f4b-4904-828f-c0d75a64470a",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "messageChannelMessageAssociation",
                                        "namePlural": "messageChannelMessageAssociations",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "131b3fe4-38db-4670-bc5b-2cea902f6796",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "f490e840-09b2-4f22-a506-5ca4be52a9f3",
                                "type": "RELATION",
                                "name": "messages",
                                "label": "Messages",
                                "description": "Messages from the thread.",
                                "icon": "IconMessage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "0029363c-bdf9-4bb3-abf1-26517f7603db",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b90048e2-39af-4fa7-a9b6-e5d12e5e04a4",
                                        "nameSingular": "messageThread",
                                        "namePlural": "messageThreads"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "f490e840-09b2-4f22-a506-5ca4be52a9f3",
                                        "name": "messages"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "9189bf90-ba43-4c13-a10b-80936e1aae51",
                                        "nameSingular": "message",
                                        "namePlural": "messages"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "47f9ee89-a2c9-4901-97f1-a9e98a843fd8",
                                        "name": "messageThread"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "0029363c-bdf9-4bb3-abf1-26517f7603db",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "47f9ee89-a2c9-4901-97f1-a9e98a843fd8",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "9189bf90-ba43-4c13-a10b-80936e1aae51",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "message",
                                        "namePlural": "messages",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "60c51422-83b7-4303-9c91-46a6c846a2d0",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "6efeb366-3dbe-41a0-85ba-74af0b2c4ecb",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                "id": "b59c2975-1963-4594-be08-116a785b812c",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
                "imageIdentifierFieldMetadataId": null,
                "fields": {
                    "__typename": "ObjectFieldsConnection",
                    "pageInfo": {
                        "__typename": "PageInfo",
                        "hasNextPage": false,
                        "hasPreviousPage": false,
                        "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                        "endCursor": "YXJyYXljb25uZWN0aW9uOjM1"
                    },
                    "edges": [
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "5370f756-a239-4bad-aa12-bc2f2d6a8295",
                                "type": "RELATION",
                                "name": "messageParticipants",
                                "label": "Message Participants",
                                "description": "Message Participants",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "3049dfc2-3d3b-45b6-b463-d916fcf7f1dd",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5370f756-a239-4bad-aa12-bc2f2d6a8295",
                                        "name": "messageParticipants"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "bcda7a99-9b9e-4fec-9ed6-ef880da81cf1",
                                        "nameSingular": "messageParticipant",
                                        "namePlural": "messageParticipants"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "91e9b2dd-4d52-4322-b070-45cfea0e4388",
                                        "name": "person"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "3049dfc2-3d3b-45b6-b463-d916fcf7f1dd",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "91e9b2dd-4d52-4322-b070-45cfea0e4388",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "bcda7a99-9b9e-4fec-9ed6-ef880da81cf1",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "messageParticipant",
                                        "namePlural": "messageParticipants",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "d12558d3-57a5-4efe-8839-48c9e042bd12",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "7de7a579-9ec9-42d4-abb1-41923e074f93",
                                "type": "RELATION",
                                "name": "favorites",
                                "label": "Favorites",
                                "description": "Favorites linked to the contact",
                                "icon": "IconHeart",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "c307b429-1493-46fc-aa62-0b2a1986b439",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "7de7a579-9ec9-42d4-abb1-41923e074f93",
                                        "name": "favorites"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "18dca64f-e99a-4804-8cce-1fdcda3cbdf3",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "36fe7c92-50be-4896-ba57-0cd8a187ab1d",
                                        "name": "person"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "c307b429-1493-46fc-aa62-0b2a1986b439",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "36fe7c92-50be-4896-ba57-0cd8a187ab1d",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "18dca64f-e99a-4804-8cce-1fdcda3cbdf3",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "a70a5252-a258-496b-a316-2ede95f1a213",
                                "type": "EMAIL",
                                "name": "email",
                                "label": "Email",
                                "description": "Contact’s Email",
                                "icon": "IconMail",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "cd0c22ad-6b98-4290-bb16-4f1a1509904b",
                                "type": "RELATION",
                                "name": "timelineActivities",
                                "label": "Events",
                                "description": "Events linked to the company",
                                "icon": "IconTimelineEvent",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "78ce5c81-3678-42a7-83c8-f6e7c3d5f965",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "cd0c22ad-6b98-4290-bb16-4f1a1509904b",
                                        "name": "timelineActivities"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "3cc410c9-41fd-4722-8a92-cbe798f89d2a",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "1e624994-6cc5-467a-9e26-5bbce9efb9e1",
                                        "name": "person"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "78ce5c81-3678-42a7-83c8-f6e7c3d5f965",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "1e624994-6cc5-467a-9e26-5bbce9efb9e1",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "3cc410c9-41fd-4722-8a92-cbe798f89d2a",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "6812c05b-797f-420d-b904-0e15b763b1ac",
                                "type": "RELATION",
                                "name": "attachments",
                                "label": "Attachments",
                                "description": "Attachments linked to the contact.",
                                "icon": "IconFileImport",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "f6f17af4-a4f6-43bc-be46-24f7d82da592",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "6812c05b-797f-420d-b904-0e15b763b1ac",
                                        "name": "attachments"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0ab14e53-605a-4863-8af4-78a5c54fd603",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "a7bffb60-44aa-4ec8-93f6-58ea67339e44",
                                        "name": "person"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "f6f17af4-a4f6-43bc-be46-24f7d82da592",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "a7bffb60-44aa-4ec8-93f6-58ea67339e44",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0ab14e53-605a-4863-8af4-78a5c54fd603",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "9ebe9c84-9535-4b83-8a0a-32a1b8865912",
                                "type": "CURRENCY",
                                "name": "testCurrency",
                                "label": "Test currency",
                                "description": null,
                                "icon": "IconUsers",
                                "isCustom": true,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:30:57.134Z",
                                "updatedAt": "2024-06-05T09:30:57.134Z",
                                "defaultValue": {
                                    "amountMicros": null,
                                    "currencyCode": "'USD'"
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
                                "id": "6ae952b7-afac-417f-b7df-16b51e8b3cc4",
                                "type": "RELATION",
                                "name": "bestCompany",
                                "label": "Best company",
                                "description": null,
                                "icon": "IconUsers",
                                "isCustom": true,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:40:44.895Z",
                                "updatedAt": "2024-06-05T09:40:44.895Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "b438326e-06d5-46a9-830f-8972727e8f3b",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "6ae952b7-afac-417f-b7df-16b51e8b3cc4",
                                        "name": "bestCompany"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "4beb1ab6-4e16-4ab9-99da-8126ae7c6a89",
                                        "name": "employeesLiked"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "b438326e-06d5-46a9-830f-8972727e8f3b",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "4beb1ab6-4e16-4ab9-99da-8126ae7c6a89",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "705bad47-d7ae-4e2f-82f0-0649080fe272",
                                "type": "POSITION",
                                "name": "position",
                                "label": "Position",
                                "description": "Person record Position",
                                "icon": "IconHierarchy2",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "76646362-c3d1-4dcf-a145-a4f4bae9946a",
                                "type": "RELATION",
                                "name": "activityTargets",
                                "label": "Activities",
                                "description": "Activities tied to the contact",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "f3705dff-02ba-4ed9-8540-4c6c8303e602",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "76646362-c3d1-4dcf-a145-a4f4bae9946a",
                                        "name": "activityTargets"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e9ea869d-b7fd-46f3-8c0d-0518ad2a21ca",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "60984ddf-f200-47d3-a07d-d0d6ecc08016",
                                        "name": "person"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "f3705dff-02ba-4ed9-8540-4c6c8303e602",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "60984ddf-f200-47d3-a07d-d0d6ecc08016",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e9ea869d-b7fd-46f3-8c0d-0518ad2a21ca",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "b24178af-364d-45cb-af15-447d7a26817a",
                                "type": "RAW_JSON",
                                "name": "testJson",
                                "label": "Test JSON",
                                "description": null,
                                "icon": "IconUsers",
                                "isCustom": true,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:32:23.559Z",
                                "updatedAt": "2024-06-05T09:32:23.559Z",
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
                                "id": "aa92fd5b-fcee-4a1f-aec9-2ac5eb47e892",
                                "type": "RATING",
                                "name": "testRating",
                                "label": "Test rating",
                                "description": null,
                                "icon": "IconUsers",
                                "isCustom": true,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:32:05.569Z",
                                "updatedAt": "2024-06-05T09:32:05.569Z",
                                "defaultValue": null,
                                "options": [
                                    {
                                        "id": "68c2d957-3bf0-4ffd-abaa-3da16bedcebf",
                                        "label": "1",
                                        "value": "RATING_1",
                                        "position": 0
                                    },
                                    {
                                        "id": "a70aff80-c013-4603-bcf0-54d40df52ccd",
                                        "label": "2",
                                        "value": "RATING_2",
                                        "position": 1
                                    },
                                    {
                                        "id": "8b702f51-a775-4609-b8b9-b6f2ba5c3059",
                                        "label": "3",
                                        "value": "RATING_3",
                                        "position": 2
                                    },
                                    {
                                        "id": "bbbec92a-3baf-4f54-bfc9-956109506c60",
                                        "label": "4",
                                        "value": "RATING_4",
                                        "position": 3
                                    },
                                    {
                                        "id": "69a64695-64e0-4f4d-afb9-d9ff9e66bf4d",
                                        "label": "5",
                                        "value": "RATING_5",
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
                                "id": "93bc6620-4224-49e5-8075-6dae46b5c6b9",
                                "type": "LINK",
                                "name": "xLink",
                                "label": "X",
                                "description": "Contact’s X/Twitter account",
                                "icon": "IconBrandX",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": {
                                    "url": "''",
                                    "label": "''"
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
                                "id": "daa0dd31-215b-4d1f-bdb6-93a12dacb1a6",
                                "type": "LINKS",
                                "name": "testLinks",
                                "label": "Test links",
                                "description": null,
                                "icon": "IconUsers",
                                "isCustom": true,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:29:39.419Z",
                                "updatedAt": "2024-06-05T09:29:39.419Z",
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
                                "id": "5d0746c4-c896-4643-b18c-6ad8e34896f6",
                                "type": "RELATION",
                                "name": "company",
                                "label": "Company",
                                "description": "Contact’s company",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "4c23197e-5d08-4bd4-a81e-409a17d6e72c",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5d0746c4-c896-4643-b18c-6ad8e34896f6",
                                        "name": "company"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "1f0a9a68-2656-4a17-b3d1-cc8cebe2eea6",
                                        "name": "people"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "4c23197e-5d08-4bd4-a81e-409a17d6e72c",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "1f0a9a68-2656-4a17-b3d1-cc8cebe2eea6",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "735d18d7-dfa6-40e6-bb50-67015d593b93",
                                "type": "UUID",
                                "name": "companyId",
                                "label": "Company id (foreign key)",
                                "description": "Contact’s company id foreign key",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "d45763f5-ad6a-4fd9-80b1-f5ef5bdb40c1",
                                "type": "TEXT",
                                "name": "avatarUrl",
                                "label": "Avatar",
                                "description": "Contact’s avatar",
                                "icon": "IconFileUpload",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "39b95b2d-2d23-47ef-b90f-9886091a6830",
                                "type": "FULL_NAME",
                                "name": "name",
                                "label": "Name",
                                "description": "Contact’s name",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "f3ec4aec-b966-4f39-bbcc-0f62acbd3573",
                                "type": "RELATION",
                                "name": "testRelationHasWorkedInCompanies",
                                "label": "Test relation has worked in companies",
                                "description": null,
                                "icon": "IconUsers",
                                "isCustom": true,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:31:52.354Z",
                                "updatedAt": "2024-06-05T09:31:52.354Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "586fb6fb-7938-41cb-9b61-06257caa4db9",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "f3ec4aec-b966-4f39-bbcc-0f62acbd3573",
                                        "name": "testRelationHasWorkedInCompanies"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "56df35a0-0802-4784-85df-05f8f0ed37a1",
                                        "name": "previousEmployees"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "586fb6fb-7938-41cb-9b61-06257caa4db9",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "56df35a0-0802-4784-85df-05f8f0ed37a1",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "company",
                                        "namePlural": "companies",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "6d37ac99-2c18-4da5-9cb2-fd373b071427",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "10c247e2-3119-4a03-870a-c141cc6d622a",
                                "type": "RELATION",
                                "name": "calendarEventParticipants",
                                "label": "Calendar Event Participants",
                                "description": "Calendar Event Participants",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "84ba4869-673e-45ac-8e25-e58dbf28d34d",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "10c247e2-3119-4a03-870a-c141cc6d622a",
                                        "name": "calendarEventParticipants"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "cef36472-b79e-45bc-aff0-60157b9807db",
                                        "nameSingular": "calendarEventParticipant",
                                        "namePlural": "calendarEventParticipants"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "1c527edc-616e-4610-9a55-5a7002fc3a17",
                                        "name": "person"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "84ba4869-673e-45ac-8e25-e58dbf28d34d",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "1c527edc-616e-4610-9a55-5a7002fc3a17",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "cef36472-b79e-45bc-aff0-60157b9807db",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "calendarEventParticipant",
                                        "namePlural": "calendarEventParticipants",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "802c0bd9-9b8a-4feb-a03b-8c8ea1dc5361",
                                "type": "MULTI_SELECT",
                                "name": "testMultiSelect",
                                "label": "Test multi select",
                                "description": null,
                                "icon": "IconUsers",
                                "isCustom": true,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:30:44.632Z",
                                "updatedAt": "2024-06-05T09:30:44.632Z",
                                "defaultValue": null,
                                "options": [
                                    {
                                        "id": "65e21c36-ac36-431b-9bc2-36936d6b6aa9",
                                        "color": "green",
                                        "label": "Option 1",
                                        "value": "OPTION_1",
                                        "position": 0
                                    },
                                    {
                                        "id": "0d212bde-8348-4482-ab69-29e2a0d7d0cc",
                                        "color": "turquoise",
                                        "label": "Option 2",
                                        "value": "OPTION_2",
                                        "position": 1
                                    },
                                    {
                                        "id": "a402e46d-518d-40e6-8d3d-7f4d649a568a",
                                        "color": "sky",
                                        "label": "Option 3",
                                        "value": "OPTION_3",
                                        "position": 2
                                    },
                                    {
                                        "id": "601353d6-c162-4dbc-9920-d0844a54eee3",
                                        "color": "blue",
                                        "label": "Option 4",
                                        "value": "OPTION_4",
                                        "position": 3
                                    },
                                    {
                                        "id": "c69b4cdc-f177-4387-8216-f486276993c7",
                                        "color": "purple",
                                        "label": "Option 5",
                                        "value": "OPTION_5",
                                        "position": 4
                                    },
                                    {
                                        "id": "3095594c-b62f-4de7-86a5-578355721f37",
                                        "color": "pink",
                                        "label": "Option 6",
                                        "value": "OPTION_6",
                                        "position": 5
                                    },
                                    {
                                        "id": "a156310e-3fd2-4d7c-96a5-0f96a2c3ce5a",
                                        "color": "red",
                                        "label": "Option 7",
                                        "value": "OPTION_7",
                                        "position": 6
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
                                "id": "0caf8552-cbdd-412d-86e1-e28e422b1e1c",
                                "type": "BOOLEAN",
                                "name": "testBoolean",
                                "label": "Test boolean",
                                "description": null,
                                "icon": "IconUsers",
                                "isCustom": true,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:29:51.982Z",
                                "updatedAt": "2024-06-05T09:29:51.982Z",
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
                                "id": "e304ec1e-15a1-45e4-ae9d-a1fa67caf162",
                                "type": "LINK",
                                "name": "linkedinLink",
                                "label": "Linkedin",
                                "description": "Contact’s Linkedin account",
                                "icon": "IconBrandLinkedin",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": {
                                    "url": "''",
                                    "label": "''"
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
                                "id": "5ff6595a-2a4b-46d5-93ad-4bbd55229d8c",
                                "type": "SELECT",
                                "name": "testSelect",
                                "label": "Test select",
                                "description": null,
                                "icon": "IconUsers",
                                "isCustom": true,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:30:15.840Z",
                                "updatedAt": "2024-06-05T09:30:27.245Z",
                                "defaultValue": null,
                                "options": [
                                    {
                                        "id": "82ebeaca-fc2b-4b26-81bc-8214bf5ef3a8",
                                        "color": "green",
                                        "label": "Option 1",
                                        "value": "OPTION_1",
                                        "position": 0
                                    },
                                    {
                                        "id": "875f2350-8543-4f2a-9df8-cca7c39356c2",
                                        "color": "turquoise",
                                        "label": "Option 2",
                                        "value": "OPTION_2",
                                        "position": 1
                                    },
                                    {
                                        "id": "988a37b3-50d5-43d8-bc73-f38f3d573300",
                                        "color": "sky",
                                        "label": "Option 3",
                                        "value": "OPTION_3",
                                        "position": 2
                                    },
                                    {
                                        "id": "ce95b461-1fb2-419d-bdb8-92bbc80f475c",
                                        "color": "blue",
                                        "label": "Option 4",
                                        "value": "OPTION_4",
                                        "position": 3
                                    },
                                    {
                                        "id": "a9c376b6-3665-46d3-b1eb-2e4caca22e94",
                                        "color": "purple",
                                        "label": "Option 5",
                                        "value": "OPTION_5",
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
                                "id": "402cbd07-4118-4dec-ac62-3cb076e974b0",
                                "type": "DATE",
                                "name": "testDateOnly",
                                "label": "Test Date only",
                                "description": null,
                                "icon": "IconUsers",
                                "isCustom": true,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:30:03.188Z",
                                "updatedAt": "2024-06-05T09:30:03.188Z",
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
                                "id": "1660eba8-1d55-4726-80a7-25939f1330e7",
                                "type": "UUID",
                                "name": "bestCompanyId",
                                "label": "Best company Foreign Key",
                                "description": null,
                                "icon": null,
                                "isCustom": true,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:40:44.895Z",
                                "updatedAt": "2024-06-05T09:40:44.895Z",
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
                                "id": "85938f34-f98b-4b9c-bdfe-6d654d1d024c",
                                "type": "ADDRESS",
                                "name": "testAddress",
                                "label": "Test address",
                                "description": null,
                                "icon": "IconUsers",
                                "isCustom": true,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:32:14.815Z",
                                "updatedAt": "2024-06-05T09:32:14.815Z",
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
                                "id": "b7d8ed75-24ab-46f4-b67e-c9559ec2a965",
                                "type": "UUID",
                                "name": "testUuid",
                                "label": "Test UUID",
                                "description": null,
                                "icon": "IconUsers",
                                "isCustom": true,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:33:08.089Z",
                                "updatedAt": "2024-06-05T09:33:08.089Z",
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
                                "id": "380aeb47-49ea-4d8d-aa78-4797b7d55876",
                                "type": "TEXT",
                                "name": "phone",
                                "label": "Phone",
                                "description": "Contact’s phone number",
                                "icon": "IconPhone",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "be344efa-a6b1-44a9-802f-8cddf7d36e68",
                                "type": "LINK",
                                "name": "testLink",
                                "label": "Test link",
                                "description": null,
                                "icon": "IconUsers",
                                "isCustom": true,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:33:21.373Z",
                                "updatedAt": "2024-06-05T09:33:21.373Z",
                                "defaultValue": {
                                    "url": "''",
                                    "label": "''"
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
                                "id": "d6bd5db3-d531-4d55-94a3-8c8f9564f606",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "7fafc1e0-b0a0-4add-b15c-6f760c954be6",
                                "type": "TEXT",
                                "name": "city",
                                "label": "City",
                                "description": "Contact’s city",
                                "icon": "IconMap",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "7a764503-b0de-4da6-b538-7c85e4b636f4",
                                "type": "PHONE",
                                "name": "testPhone",
                                "label": "Test phone",
                                "description": null,
                                "icon": "IconUsers",
                                "isCustom": true,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:33:36.055Z",
                                "updatedAt": "2024-06-05T09:33:36.055Z",
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
                                "id": "4e0c2529-6d91-47ea-bb74-65731f131a73",
                                "type": "RELATION",
                                "name": "pointOfContactForOpportunities",
                                "label": "POC for Opportunities",
                                "description": "Point of Contact for Opportunities",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "0f6e2b8c-e8a7-4176-abcc-3d6ca333a53f",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "4e0c2529-6d91-47ea-bb74-65731f131a73",
                                        "name": "pointOfContactForOpportunities"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "50fb71e4-ba3e-4c98-892e-5b11761e69cf",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "03be65f3-d130-406c-9e36-9bf74141c398",
                                        "name": "pointOfContact"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "0f6e2b8c-e8a7-4176-abcc-3d6ca333a53f",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "03be65f3-d130-406c-9e36-9bf74141c398",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "50fb71e4-ba3e-4c98-892e-5b11761e69cf",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "f5cf7307-4aff-487e-95a7-dca06a7d1b54",
                                "type": "TEXT",
                                "name": "jobTitle",
                                "label": "Job Title",
                                "description": "Contact’s job title",
                                "icon": "IconBriefcase",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                "id": "a4eb671b-53d4-4092-99aa-22d918c34a7f",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                "nameSingular": "behavioralEvent",
                "namePlural": "behavioralEvents",
                "labelSingular": "Behavioral Event",
                "labelPlural": "Behavioral Events",
                "description": "An event related to user behavior",
                "icon": "IconIconTimelineEvent",
                "isCustom": false,
                "isRemote": false,
                "isActive": true,
                "isSystem": true,
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "4d16bdb4-6320-4ceb-82ba-60026a884637",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "7ac72719-4663-4869-9ea8-14e9afebca6b",
                                "type": "RAW_JSON",
                                "name": "context",
                                "label": "Event context",
                                "description": "Json object to provide context (user, device, workspace, etc.)",
                                "icon": "IconListDetails",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "c5c2e8e1-0bc2-4af9-94fc-5d88bb453004",
                                "type": "TEXT",
                                "name": "name",
                                "label": "Event name",
                                "description": "Event name",
                                "icon": "IconAbc",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "5ab3b81a-d9ac-41a6-9300-c71abbab68be",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "bafd3762-1249-480d-8c3b-c71db6e3b3f8",
                                "type": "TEXT",
                                "name": "objectName",
                                "label": "Object name",
                                "description": "If the event is related to a particular object",
                                "icon": "IconAbc",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "62e4c338-ad79-4003-b1ce-b14d43bfab4d",
                                "type": "UUID",
                                "name": "recordId",
                                "label": "Object id",
                                "description": "Event name/type",
                                "icon": "IconAbc",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "7cb33967-0ee5-476d-84dd-f94fd3824a52",
                                "type": "RAW_JSON",
                                "name": "properties",
                                "label": "Event details",
                                "description": "Json value for event details",
                                "icon": "IconListDetails",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "11201100-a42e-4b77-b9e5-dd777731dd13",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                "id": "9a5b559e-86ab-4189-8edd-8f8c6b6cd474",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "5b1d9d73-91cd-4b92-8477-ccb93fb9f98e",
                                "type": "TEXT",
                                "name": "lastSyncHistoryId",
                                "label": "Last sync history ID",
                                "description": "Last sync history ID",
                                "icon": "IconHistory",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "e4fe7458-5c73-45aa-a1c4-fb10263f7c72",
                                "type": "RELATION",
                                "name": "messageChannels",
                                "label": "Message Channels",
                                "description": "Message Channels",
                                "icon": "IconMessage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "ae1e0173-b7dd-4b2f-9ef1-4010ad2309b3",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "9a5b559e-86ab-4189-8edd-8f8c6b6cd474",
                                        "nameSingular": "connectedAccount",
                                        "namePlural": "connectedAccounts"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "e4fe7458-5c73-45aa-a1c4-fb10263f7c72",
                                        "name": "messageChannels"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dcc47dfd-6e83-468c-ab20-c4db02ba0cf4",
                                        "nameSingular": "messageChannel",
                                        "namePlural": "messageChannels"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "6b046e71-d326-4012-9d83-59ae70b55e9e",
                                        "name": "connectedAccount"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "ae1e0173-b7dd-4b2f-9ef1-4010ad2309b3",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "6b046e71-d326-4012-9d83-59ae70b55e9e",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dcc47dfd-6e83-468c-ab20-c4db02ba0cf4",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "messageChannel",
                                        "namePlural": "messageChannels",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "7861149f-0c2d-4ef3-9121-65aed82f8aa4",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "30c7b0eb-6d39-4e31-b058-d9b8997bac63",
                                "type": "DATE_TIME",
                                "name": "authFailedAt",
                                "label": "Auth failed at",
                                "description": "Auth failed at",
                                "icon": "IconX",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "5ac080df-2969-4343-aacd-ea166d54f71d",
                                "type": "TEXT",
                                "name": "handle",
                                "label": "handle",
                                "description": "The account handle (email, username, phone number, etc.)",
                                "icon": "IconMail",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "12495fbd-6344-4ac3-a92a-9ebac34bd8e5",
                                "type": "RELATION",
                                "name": "accountOwner",
                                "label": "Account Owner",
                                "description": "Account Owner",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "10e3e707-b021-4b00-98ec-391c198fd91e",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "9a5b559e-86ab-4189-8edd-8f8c6b6cd474",
                                        "nameSingular": "connectedAccount",
                                        "namePlural": "connectedAccounts"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "12495fbd-6344-4ac3-a92a-9ebac34bd8e5",
                                        "name": "accountOwner"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "667d1935-2162-40fd-920c-6c26da5f9148",
                                        "name": "connectedAccounts"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "10e3e707-b021-4b00-98ec-391c198fd91e",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "667d1935-2162-40fd-920c-6c26da5f9148",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "867aaf6c-1dce-48e3-842e-f8c5c1a20925",
                                "type": "RELATION",
                                "name": "calendarChannels",
                                "label": "Calendar Channels",
                                "description": "Calendar Channels",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "791a73d3-d66e-468b-bc59-945205ec0bf2",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "9a5b559e-86ab-4189-8edd-8f8c6b6cd474",
                                        "nameSingular": "connectedAccount",
                                        "namePlural": "connectedAccounts"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "867aaf6c-1dce-48e3-842e-f8c5c1a20925",
                                        "name": "calendarChannels"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "66310199-acad-402e-b2cd-5052dfa7b439",
                                        "nameSingular": "calendarChannel",
                                        "namePlural": "calendarChannels"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "da4162c5-19d9-45b8-b7fe-d8466d7706f0",
                                        "name": "connectedAccount"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "791a73d3-d66e-468b-bc59-945205ec0bf2",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "da4162c5-19d9-45b8-b7fe-d8466d7706f0",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "66310199-acad-402e-b2cd-5052dfa7b439",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "calendarChannel",
                                        "namePlural": "calendarChannels",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "082a282d-dddd-4424-9f20-755bebc359fd",
                                "type": "UUID",
                                "name": "accountOwnerId",
                                "label": "Account Owner id (foreign key)",
                                "description": "Account Owner id foreign key",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "c913ca38-130d-4149-b860-834b11d73b5e",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "adf50c98-de8f-4e35-bb20-aadeb4947d10",
                                "type": "TEXT",
                                "name": "accessToken",
                                "label": "Access Token",
                                "description": "Messaging provider access token",
                                "icon": "IconKey",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "eb7aab8a-e2d4-4cf7-94f1-e68465051de4",
                                "type": "TEXT",
                                "name": "provider",
                                "label": "provider",
                                "description": "The account provider",
                                "icon": "IconSettings",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "332191dd-bc65-4b10-9edd-9cbecb0f0df4",
                                "type": "TEXT",
                                "name": "refreshToken",
                                "label": "Refresh Token",
                                "description": "Messaging provider refresh token",
                                "icon": "IconKey",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "67834ac2-0a53-4c82-a21c-78734d159ae4",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                "id": "9189bf90-ba43-4c13-a10b-80936e1aae51",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "d7c5dd73-fecc-4028-977b-90a9421a8b06",
                                "type": "UUID",
                                "name": "messageThreadId",
                                "label": "Message Thread Id id (foreign key)",
                                "description": "Message Thread Id id foreign key",
                                "icon": "IconHash",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "05d6f0ea-e03b-4fca-81f8-6a444b0cb7cf",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "f5c6902c-007b-40a9-bbe7-ab6956b9e639",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "e8846f02-bd9b-492b-b004-11772ec9f358",
                                "type": "RELATION",
                                "name": "messageParticipants",
                                "label": "Message Participants",
                                "description": "Message Participants",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "699b7574-6a7f-4b86-869d-931e8efc2dd7",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "9189bf90-ba43-4c13-a10b-80936e1aae51",
                                        "nameSingular": "message",
                                        "namePlural": "messages"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "e8846f02-bd9b-492b-b004-11772ec9f358",
                                        "name": "messageParticipants"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "bcda7a99-9b9e-4fec-9ed6-ef880da81cf1",
                                        "nameSingular": "messageParticipant",
                                        "namePlural": "messageParticipants"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "87b3b019-e6e7-42d9-a89a-bbf4a007f7fc",
                                        "name": "message"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "699b7574-6a7f-4b86-869d-931e8efc2dd7",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "87b3b019-e6e7-42d9-a89a-bbf4a007f7fc",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "bcda7a99-9b9e-4fec-9ed6-ef880da81cf1",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "messageParticipant",
                                        "namePlural": "messageParticipants",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "a1566084-a7e4-432f-b146-855151a3a36f",
                                "type": "TEXT",
                                "name": "headerMessageId",
                                "label": "Header message Id",
                                "description": "Message id from the message header",
                                "icon": "IconHash",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "8f908c49-4201-4e12-a819-957bf9bbd016",
                                "type": "TEXT",
                                "name": "subject",
                                "label": "Subject",
                                "description": "Subject",
                                "icon": "IconMessage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "0a6b51e7-05e1-4aea-8d79-0ecc44cdbbe5",
                                "type": "SELECT",
                                "name": "direction",
                                "label": "Direction",
                                "description": "Message Direction",
                                "icon": "IconDirection",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": "'incoming'",
                                "options": [
                                    {
                                        "id": "bfa1229e-c2be-49da-a87b-ed38e653dcae",
                                        "color": "green",
                                        "label": "Incoming",
                                        "value": "incoming",
                                        "position": 0
                                    },
                                    {
                                        "id": "6e1dcbd1-7ce9-4016-912e-d47faef2ce76",
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
                                "id": "92eca905-7a0c-4735-b7c4-5186d9f2137f",
                                "type": "RELATION",
                                "name": "messageChannelMessageAssociations",
                                "label": "Message Channel Association",
                                "description": "Messages from the channel.",
                                "icon": "IconMessage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "8ac4ca02-468d-4d57-9240-629a4cc05297",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "9189bf90-ba43-4c13-a10b-80936e1aae51",
                                        "nameSingular": "message",
                                        "namePlural": "messages"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "92eca905-7a0c-4735-b7c4-5186d9f2137f",
                                        "name": "messageChannelMessageAssociations"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "83c58624-5f4b-4904-828f-c0d75a64470a",
                                        "nameSingular": "messageChannelMessageAssociation",
                                        "namePlural": "messageChannelMessageAssociations"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "3d43517d-c2be-42c7-be22-b9a327944d57",
                                        "name": "message"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "8ac4ca02-468d-4d57-9240-629a4cc05297",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "3d43517d-c2be-42c7-be22-b9a327944d57",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "83c58624-5f4b-4904-828f-c0d75a64470a",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "messageChannelMessageAssociation",
                                        "namePlural": "messageChannelMessageAssociations",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "d98cc004-c7e5-4446-b65d-31f4ef5a3243",
                                "type": "TEXT",
                                "name": "text",
                                "label": "Text",
                                "description": "Text",
                                "icon": "IconMessage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "47f9ee89-a2c9-4901-97f1-a9e98a843fd8",
                                "type": "RELATION",
                                "name": "messageThread",
                                "label": "Message Thread Id",
                                "description": "Message Thread Id",
                                "icon": "IconHash",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "0029363c-bdf9-4bb3-abf1-26517f7603db",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "9189bf90-ba43-4c13-a10b-80936e1aae51",
                                        "nameSingular": "message",
                                        "namePlural": "messages"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "47f9ee89-a2c9-4901-97f1-a9e98a843fd8",
                                        "name": "messageThread"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b90048e2-39af-4fa7-a9b6-e5d12e5e04a4",
                                        "nameSingular": "messageThread",
                                        "namePlural": "messageThreads"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "f490e840-09b2-4f22-a506-5ca4be52a9f3",
                                        "name": "messages"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "0029363c-bdf9-4bb3-abf1-26517f7603db",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "f490e840-09b2-4f22-a506-5ca4be52a9f3",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b90048e2-39af-4fa7-a9b6-e5d12e5e04a4",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "f9556231-b9e2-4f69-b12e-f125740ec2b8",
                                "type": "DATE_TIME",
                                "name": "receivedAt",
                                "label": "Received At",
                                "description": "The date the message was received",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "e649f11f-9676-4352-8883-2977bd796d4e",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                "id": "83c58624-5f4b-4904-828f-c0d75a64470a",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "9833ffd4-a159-467e-af01-dff4185a1a93",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "bb012003-6276-4d28-8cf6-871db99aa771",
                                "type": "TEXT",
                                "name": "messageThreadExternalId",
                                "label": "Thread External Id",
                                "description": "Thread id from the messaging provider",
                                "icon": "IconHash",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "9ff0f228-144c-4a06-b924-6208c98b7be2",
                                "type": "RELATION",
                                "name": "messageChannel",
                                "label": "Message Channel Id",
                                "description": "Message Channel Id",
                                "icon": "IconHash",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "99cfc7c7-4e29-4555-b1cf-07e3ca674ebc",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "83c58624-5f4b-4904-828f-c0d75a64470a",
                                        "nameSingular": "messageChannelMessageAssociation",
                                        "namePlural": "messageChannelMessageAssociations"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "9ff0f228-144c-4a06-b924-6208c98b7be2",
                                        "name": "messageChannel"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dcc47dfd-6e83-468c-ab20-c4db02ba0cf4",
                                        "nameSingular": "messageChannel",
                                        "namePlural": "messageChannels"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "57e22ced-bae3-4a28-9738-feb07a71d680",
                                        "name": "messageChannelMessageAssociations"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "99cfc7c7-4e29-4555-b1cf-07e3ca674ebc",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "57e22ced-bae3-4a28-9738-feb07a71d680",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "dcc47dfd-6e83-468c-ab20-c4db02ba0cf4",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "1d17aa72-73c8-471e-b583-2860aafe6d63",
                                "type": "UUID",
                                "name": "messageChannelId",
                                "label": "Message Channel Id id (foreign key)",
                                "description": "Message Channel Id id foreign key",
                                "icon": "IconHash",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "e571b966-32f8-4d4f-89a1-04459472f3b5",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "a48f198f-4879-4caa-9e2d-a6f89b0453d1",
                                "type": "UUID",
                                "name": "messageId",
                                "label": "Message Id id (foreign key)",
                                "description": "Message Id id foreign key",
                                "icon": "IconHash",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "f3ba90e8-2c41-49f9-9489-907d352fd2ed",
                                "type": "RELATION",
                                "name": "messageThread",
                                "label": "Message Thread Id",
                                "description": "Message Thread Id",
                                "icon": "IconHash",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "46c93e08-e73c-4383-a582-b5eacabb0b29",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "83c58624-5f4b-4904-828f-c0d75a64470a",
                                        "nameSingular": "messageChannelMessageAssociation",
                                        "namePlural": "messageChannelMessageAssociations"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "f3ba90e8-2c41-49f9-9489-907d352fd2ed",
                                        "name": "messageThread"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b90048e2-39af-4fa7-a9b6-e5d12e5e04a4",
                                        "nameSingular": "messageThread",
                                        "namePlural": "messageThreads"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "cb8d77ef-a7f9-4087-8103-fd70d3cb9cdf",
                                        "name": "messageChannelMessageAssociations"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "46c93e08-e73c-4383-a582-b5eacabb0b29",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "cb8d77ef-a7f9-4087-8103-fd70d3cb9cdf",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b90048e2-39af-4fa7-a9b6-e5d12e5e04a4",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "3d43517d-c2be-42c7-be22-b9a327944d57",
                                "type": "RELATION",
                                "name": "message",
                                "label": "Message Id",
                                "description": "Message Id",
                                "icon": "IconHash",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "8ac4ca02-468d-4d57-9240-629a4cc05297",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "83c58624-5f4b-4904-828f-c0d75a64470a",
                                        "nameSingular": "messageChannelMessageAssociation",
                                        "namePlural": "messageChannelMessageAssociations"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "3d43517d-c2be-42c7-be22-b9a327944d57",
                                        "name": "message"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "9189bf90-ba43-4c13-a10b-80936e1aae51",
                                        "nameSingular": "message",
                                        "namePlural": "messages"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "92eca905-7a0c-4735-b7c4-5186d9f2137f",
                                        "name": "messageChannelMessageAssociations"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "8ac4ca02-468d-4d57-9240-629a4cc05297",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "92eca905-7a0c-4735-b7c4-5186d9f2137f",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "9189bf90-ba43-4c13-a10b-80936e1aae51",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "fb320f08-5d20-478e-9b73-cdb1513e8272",
                                "type": "UUID",
                                "name": "messageThreadId",
                                "label": "Message Thread Id id (foreign key)",
                                "description": "Message Thread Id id foreign key",
                                "icon": "IconHash",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "a7f4e0e2-24d7-4210-97c3-73c356dfdabf",
                                "type": "TEXT",
                                "name": "messageExternalId",
                                "label": "Message External Id",
                                "description": "Message id from the messaging provider",
                                "icon": "IconHash",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "50b5b45c-577c-4fe5-ab9c-7f500dc9a4c9",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                "id": "7c7146f6-bc09-4ca4-9d4d-e17c4b396290",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "feeee45e-3061-4b69-8182-0671fc055df9",
                                "type": "TEXT",
                                "name": "name",
                                "label": "Name",
                                "description": "ApiKey name",
                                "icon": "IconLink",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "d3fce7fa-73c7-42e6-8aaa-f27735af8ad4",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "7919df4f-e78c-49e0-87bf-731c6ff58cc4",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "7c84089f-f3a8-4127-b3ad-a6a158fbf3e1",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "dc298993-d355-4327-9ec1-200ed3d74b60",
                                "type": "DATE_TIME",
                                "name": "expiresAt",
                                "label": "Expiration date",
                                "description": "ApiKey expiration date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "8ddf2915-b923-4ced-b7ef-b2d31abeea24",
                                "type": "DATE_TIME",
                                "name": "revokedAt",
                                "label": "Revocation date",
                                "description": "ApiKey revocation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                "id": "79f50dfc-f163-497b-8662-79a83ab81b31",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "0963b7b9-9d8e-4f2c-96f0-2fa557d2fc11",
                                "type": "TEXT",
                                "name": "recurringEventExternalId",
                                "label": "Recurring Event ID",
                                "description": "Recurring Event ID",
                                "icon": "IconHistory",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "7fc603fe-360d-421d-ae17-f642b8c05558",
                                "type": "DATE_TIME",
                                "name": "startsAt",
                                "label": "Start Date",
                                "description": "Start Date",
                                "icon": "IconCalendarClock",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "1ee1f484-9dcc-4679-aa00-a8e9019b2ef3",
                                "type": "DATE_TIME",
                                "name": "endsAt",
                                "label": "End Date",
                                "description": "End Date",
                                "icon": "IconCalendarClock",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "cf82ee9d-013e-485f-8307-adbe3faa8df6",
                                "type": "LINK",
                                "name": "conferenceLink",
                                "label": "Meet Link",
                                "description": "Meet Link",
                                "icon": "IconLink",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": {
                                    "url": "''",
                                    "label": "''"
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
                                "id": "5dcf82b8-1acb-4a09-80a9-3ab3b6edad1d",
                                "type": "RELATION",
                                "name": "calendarEventParticipants",
                                "label": "Event Participants",
                                "description": "Event Participants",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "a335bc90-4bc0-4aa2-b7b3-191b7d30e823",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "79f50dfc-f163-497b-8662-79a83ab81b31",
                                        "nameSingular": "calendarEvent",
                                        "namePlural": "calendarEvents"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5dcf82b8-1acb-4a09-80a9-3ab3b6edad1d",
                                        "name": "calendarEventParticipants"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "cef36472-b79e-45bc-aff0-60157b9807db",
                                        "nameSingular": "calendarEventParticipant",
                                        "namePlural": "calendarEventParticipants"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "316bfc58-4813-419c-85aa-1bd96cdb6d9b",
                                        "name": "calendarEvent"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "a335bc90-4bc0-4aa2-b7b3-191b7d30e823",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "316bfc58-4813-419c-85aa-1bd96cdb6d9b",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "cef36472-b79e-45bc-aff0-60157b9807db",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "calendarEventParticipant",
                                        "namePlural": "calendarEventParticipants",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "328ddfbb-9444-43b4-9830-0a6f1b6180c9",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "2e43cbdf-990c-4482-8a67-316619259cca",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "7a375b70-0f52-4e6c-ae7d-45e94e4e9c37",
                                "type": "TEXT",
                                "name": "description",
                                "label": "Description",
                                "description": "Description",
                                "icon": "IconFileDescription",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "a940e44b-6ca6-4e5e-9c04-b45b044098e6",
                                "type": "BOOLEAN",
                                "name": "isCanceled",
                                "label": "Is canceled",
                                "description": "Is canceled",
                                "icon": "IconCalendarCancel",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "616b6cf4-60dc-47dc-9792-87e6bd6a4640",
                                "type": "RELATION",
                                "name": "calendarChannelEventAssociations",
                                "label": "Calendar Channel Event Associations",
                                "description": "Calendar Channel Event Associations",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "eaed4145-5a79-4c0e-9242-6e4af16a2540",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "79f50dfc-f163-497b-8662-79a83ab81b31",
                                        "nameSingular": "calendarEvent",
                                        "namePlural": "calendarEvents"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "616b6cf4-60dc-47dc-9792-87e6bd6a4640",
                                        "name": "calendarChannelEventAssociations"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "6ebe5630-4745-471c-8d58-6f7c38346f5c",
                                        "nameSingular": "calendarChannelEventAssociation",
                                        "namePlural": "calendarChannelEventAssociations"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "9593c215-1fcf-4c85-9e60-85744dfee3c2",
                                        "name": "calendarEvent"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "eaed4145-5a79-4c0e-9242-6e4af16a2540",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "9593c215-1fcf-4c85-9e60-85744dfee3c2",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "6ebe5630-4745-471c-8d58-6f7c38346f5c",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "calendarChannelEventAssociation",
                                        "namePlural": "calendarChannelEventAssociations",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "897ee884-8c40-4b9c-a650-065ed79f7e44",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "ef66e1a8-1b46-4618-97c9-35cae1adc9c9",
                                "type": "DATE_TIME",
                                "name": "externalUpdatedAt",
                                "label": "Update DateTime",
                                "description": "Update DateTime",
                                "icon": "IconCalendarCog",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "6031f950-f7c0-4e68-8930-769267e874eb",
                                "type": "TEXT",
                                "name": "iCalUID",
                                "label": "iCal UID",
                                "description": "iCal UID",
                                "icon": "IconKey",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "f3012260-8177-4e44-b711-80f09fbe3c47",
                                "type": "TEXT",
                                "name": "conferenceSolution",
                                "label": "Conference Solution",
                                "description": "Conference Solution",
                                "icon": "IconScreenShare",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "7cdeb29c-1401-4038-a2ff-16ab4bf46dca",
                                "type": "TEXT",
                                "name": "location",
                                "label": "Location",
                                "description": "Location",
                                "icon": "IconMapPin",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "3c7fc7fb-2a56-448b-9188-5924eb755340",
                                "type": "DATE_TIME",
                                "name": "externalCreatedAt",
                                "label": "Creation DateTime",
                                "description": "Creation DateTime",
                                "icon": "IconCalendarPlus",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "7cdded6b-8dc1-4e33-8f78-f66411cb55e1",
                                "type": "BOOLEAN",
                                "name": "isFullDay",
                                "label": "Is Full Day",
                                "description": "Is Full Day",
                                "icon": "Icon24Hours",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "b6a48ded-6ccf-4502-91ea-3baeddeebee7",
                                "type": "TEXT",
                                "name": "title",
                                "label": "Title",
                                "description": "Title",
                                "icon": "IconH1",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                "id": "6ebe5630-4745-471c-8d58-6f7c38346f5c",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "d9c70d3d-c324-47ca-a5a3-435ed9acfc68",
                                "type": "RELATION",
                                "name": "calendarChannel",
                                "label": "Channel ID",
                                "description": "Channel ID",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "138c6a9c-53ee-498a-bac0-6e229f3cc1a4",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "6ebe5630-4745-471c-8d58-6f7c38346f5c",
                                        "nameSingular": "calendarChannelEventAssociation",
                                        "namePlural": "calendarChannelEventAssociations"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "d9c70d3d-c324-47ca-a5a3-435ed9acfc68",
                                        "name": "calendarChannel"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "66310199-acad-402e-b2cd-5052dfa7b439",
                                        "nameSingular": "calendarChannel",
                                        "namePlural": "calendarChannels"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "91f24471-e0e2-4035-aa4e-24c04a74670e",
                                        "name": "calendarChannelEventAssociations"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "138c6a9c-53ee-498a-bac0-6e229f3cc1a4",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "91f24471-e0e2-4035-aa4e-24c04a74670e",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "66310199-acad-402e-b2cd-5052dfa7b439",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "73d03ebe-d90c-4ab3-be5a-98aed89f957e",
                                "type": "UUID",
                                "name": "calendarChannelId",
                                "label": "Channel ID id (foreign key)",
                                "description": "Channel ID id foreign key",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "2a25c546-61f0-4ab8-9d59-914320a7aebf",
                                "type": "TEXT",
                                "name": "eventExternalId",
                                "label": "Event external ID",
                                "description": "Event external ID",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "9b2ae29e-05d0-45b9-9505-89140bff0897",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "b8c52644-24ee-45b2-aecb-b3da54231e66",
                                "type": "UUID",
                                "name": "calendarEventId",
                                "label": "Event ID id (foreign key)",
                                "description": "Event ID id foreign key",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "44068db1-7c2a-43cf-9759-2a4c88996250",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "82589f83-d2c6-47b0-b99b-c71f35cba04b",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "9593c215-1fcf-4c85-9e60-85744dfee3c2",
                                "type": "RELATION",
                                "name": "calendarEvent",
                                "label": "Event ID",
                                "description": "Event ID",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "eaed4145-5a79-4c0e-9242-6e4af16a2540",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "6ebe5630-4745-471c-8d58-6f7c38346f5c",
                                        "nameSingular": "calendarChannelEventAssociation",
                                        "namePlural": "calendarChannelEventAssociations"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "9593c215-1fcf-4c85-9e60-85744dfee3c2",
                                        "name": "calendarEvent"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "79f50dfc-f163-497b-8662-79a83ab81b31",
                                        "nameSingular": "calendarEvent",
                                        "namePlural": "calendarEvents"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "616b6cf4-60dc-47dc-9792-87e6bd6a4640",
                                        "name": "calendarChannelEventAssociations"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "eaed4145-5a79-4c0e-9242-6e4af16a2540",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "616b6cf4-60dc-47dc-9792-87e6bd6a4640",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "79f50dfc-f163-497b-8662-79a83ab81b31",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "calendarEvent",
                                        "namePlural": "calendarEvents",
                                        "isSystem": true,
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
                "id": "68e8546d-b890-4fb2-a289-2c33f1fbcd75",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "764984d5-cf98-4fd4-9ffd-a36eea63f982",
                                "type": "TEXT",
                                "name": "name",
                                "label": "Event name",
                                "description": "Event name/type",
                                "icon": "IconAbc",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "9a313827-a4b0-444f-bc44-1c0735d23d51",
                                "type": "RAW_JSON",
                                "name": "context",
                                "label": "Event context",
                                "description": "Json object to provide context (user, device, workspace, etc.)",
                                "icon": "IconListDetails",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "9b258a70-15a8-4a87-9fcf-774bf9b120ac",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "3b68390c-3bbd-4362-a367-5e2d1431583e",
                                "type": "TEXT",
                                "name": "objectName",
                                "label": "Object name",
                                "description": "If the event is related to a particular object",
                                "icon": "IconAbc",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "d5ca055b-2fff-48a8-9172-cde9793ea176",
                                "type": "TEXT",
                                "name": "objectMetadataId",
                                "label": "Object name",
                                "description": "If the event is related to a particular object",
                                "icon": "IconAbc",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "29bf4d5a-945b-43b6-9d5c-1b2bf07974c7",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "2464a96f-1f1f-44b3-811a-9107ee9008bd",
                                "type": "UUID",
                                "name": "workspaceMemberId",
                                "label": "Workspace Member id (foreign key)",
                                "description": "Event workspace member id foreign key",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "e814292d-7163-4fec-b7b7-3fd643515b71",
                                "type": "UUID",
                                "name": "recordId",
                                "label": "Object id",
                                "description": "Event name/type",
                                "icon": "IconAbc",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "16298301-b6be-4eab-9d0c-86efd5914d93",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "591b25a5-b235-4574-92a4-da76589cf830",
                                "type": "RELATION",
                                "name": "workspaceMember",
                                "label": "Workspace Member",
                                "description": "Event workspace member",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "2eed98d4-3672-4bfb-8e60-337943d3711b",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "68e8546d-b890-4fb2-a289-2c33f1fbcd75",
                                        "nameSingular": "auditLog",
                                        "namePlural": "auditLogs"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "591b25a5-b235-4574-92a4-da76589cf830",
                                        "name": "workspaceMember"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "b57b985a-5566-47e7-9b1d-626ecaffa748",
                                        "name": "auditLogs"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "2eed98d4-3672-4bfb-8e60-337943d3711b",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "b57b985a-5566-47e7-9b1d-626ecaffa748",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "038abb1b-c4ef-4c1d-84cb-489f2936be5a",
                                "type": "RAW_JSON",
                                "name": "properties",
                                "label": "Event details",
                                "description": "Json value for event details",
                                "icon": "IconListDetails",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                "id": "66310199-acad-402e-b2cd-5052dfa7b439",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "a1fefc2f-123e-4a1f-ada2-12c91702a6ba",
                                "type": "TEXT",
                                "name": "syncCursor",
                                "label": "Sync Cursor",
                                "description": "Sync Cursor. Used for syncing events from the calendar provider",
                                "icon": "IconReload",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "34eb48ca-9e74-4f3a-9116-20bb697f261b",
                                "type": "BOOLEAN",
                                "name": "isContactAutoCreationEnabled",
                                "label": "Is Contact Auto Creation Enabled",
                                "description": "Is Contact Auto Creation Enabled",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "1be6f4e0-20cc-4cb4-a01c-98784bff7eb2",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "21da875f-baf1-4a59-9a9f-fcb5617288e0",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "da4162c5-19d9-45b8-b7fe-d8466d7706f0",
                                "type": "RELATION",
                                "name": "connectedAccount",
                                "label": "Connected Account",
                                "description": "Connected Account",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "791a73d3-d66e-468b-bc59-945205ec0bf2",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "66310199-acad-402e-b2cd-5052dfa7b439",
                                        "nameSingular": "calendarChannel",
                                        "namePlural": "calendarChannels"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "da4162c5-19d9-45b8-b7fe-d8466d7706f0",
                                        "name": "connectedAccount"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "9a5b559e-86ab-4189-8edd-8f8c6b6cd474",
                                        "nameSingular": "connectedAccount",
                                        "namePlural": "connectedAccounts"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "867aaf6c-1dce-48e3-842e-f8c5c1a20925",
                                        "name": "calendarChannels"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "791a73d3-d66e-468b-bc59-945205ec0bf2",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "867aaf6c-1dce-48e3-842e-f8c5c1a20925",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "9a5b559e-86ab-4189-8edd-8f8c6b6cd474",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "9edf5522-f4e7-445f-9cb6-a5886eca8a13",
                                "type": "TEXT",
                                "name": "handle",
                                "label": "Handle",
                                "description": "Handle",
                                "icon": "IconAt",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "66d9f972-daec-4706-bf85-3e033087c6d9",
                                "type": "NUMBER",
                                "name": "throttleFailureCount",
                                "label": "Throttle Failure Count",
                                "description": "Throttle Failure Count",
                                "icon": "IconX",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "bb442c98-3845-4ab4-9794-a8853c7f3efb",
                                "type": "UUID",
                                "name": "connectedAccountId",
                                "label": "Connected Account id (foreign key)",
                                "description": "Connected Account id foreign key",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "ee326d0b-f7d7-4c8d-b898-078317a304b7",
                                "type": "DATE_TIME",
                                "name": "throttlePauseUntil",
                                "label": "Throttle Pause Until",
                                "description": "Throttle Pause Until",
                                "icon": "IconPlayerPause",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "34c5dabc-5f57-48cc-9c5a-16b2aca16d97",
                                "type": "SELECT",
                                "name": "visibility",
                                "label": "Visibility",
                                "description": "Visibility",
                                "icon": "IconEyeglass",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": "'SHARE_EVERYTHING'",
                                "options": [
                                    {
                                        "id": "123f3f7f-c90a-4e19-b340-7ca5aba165e7",
                                        "color": "green",
                                        "label": "Metadata",
                                        "value": "METADATA",
                                        "position": 0
                                    },
                                    {
                                        "id": "78cdc844-3a43-4efe-808d-7d51b70fa573",
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
                                "id": "622890b7-e61e-4f2b-b307-a0ff9601aa6d",
                                "type": "BOOLEAN",
                                "name": "isSyncEnabled",
                                "label": "Is Sync Enabled",
                                "description": "Is Sync Enabled",
                                "icon": "IconRefresh",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "b1e0d1bb-3e37-4ae2-b02c-4df1365710f2",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "91f24471-e0e2-4035-aa4e-24c04a74670e",
                                "type": "RELATION",
                                "name": "calendarChannelEventAssociations",
                                "label": "Calendar Channel Event Associations",
                                "description": "Calendar Channel Event Associations",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "138c6a9c-53ee-498a-bac0-6e229f3cc1a4",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "66310199-acad-402e-b2cd-5052dfa7b439",
                                        "nameSingular": "calendarChannel",
                                        "namePlural": "calendarChannels"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "91f24471-e0e2-4035-aa4e-24c04a74670e",
                                        "name": "calendarChannelEventAssociations"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "6ebe5630-4745-471c-8d58-6f7c38346f5c",
                                        "nameSingular": "calendarChannelEventAssociation",
                                        "namePlural": "calendarChannelEventAssociations"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "d9c70d3d-c324-47ca-a5a3-435ed9acfc68",
                                        "name": "calendarChannel"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "138c6a9c-53ee-498a-bac0-6e229f3cc1a4",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "d9c70d3d-c324-47ca-a5a3-435ed9acfc68",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "6ebe5630-4745-471c-8d58-6f7c38346f5c",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "calendarChannelEventAssociation",
                                        "namePlural": "calendarChannelEventAssociations",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
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
                "id": "5473e152-fe49-477c-aab6-f1b4a042a8bf",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "d4992a89-c244-41dc-b21b-c05478c351a8",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "e0586b12-ebf1-4e91-a19c-678bcd158896",
                                "type": "RELATION",
                                "name": "view",
                                "label": "View",
                                "description": "View Field related view",
                                "icon": "IconLayoutCollage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "7a54da00-dcf4-4efa-8f1a-c1fd68bff8d1",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "5473e152-fe49-477c-aab6-f1b4a042a8bf",
                                        "nameSingular": "viewField",
                                        "namePlural": "viewFields"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "e0586b12-ebf1-4e91-a19c-678bcd158896",
                                        "name": "view"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e881ed81-8683-478a-95fa-8eb430056d42",
                                        "nameSingular": "view",
                                        "namePlural": "views"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "2932c2e4-dd2f-4187-9935-e09826db5fdd",
                                        "name": "viewFields"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "7a54da00-dcf4-4efa-8f1a-c1fd68bff8d1",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "2932c2e4-dd2f-4187-9935-e09826db5fdd",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e881ed81-8683-478a-95fa-8eb430056d42",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "a9d9c985-7cfd-45b0-ae6a-f866fb50f890",
                                "type": "NUMBER",
                                "name": "size",
                                "label": "Size",
                                "description": "View Field size",
                                "icon": "IconEye",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "c979c51c-cf86-4308-a4b5-044cdcf85484",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "1d8e783e-de68-4619-97b2-8bcb68f0dd81",
                                "type": "NUMBER",
                                "name": "position",
                                "label": "Position",
                                "description": "View Field position",
                                "icon": "IconList",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "01cd6fe4-a9d9-4f13-808b-430eefb08e38",
                                "type": "UUID",
                                "name": "fieldMetadataId",
                                "label": "Field Metadata Id",
                                "description": "View Field target field",
                                "icon": "IconTag",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "beccc490-149c-4700-ad53-6b4583b04e04",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "5e0c3682-c7ba-47f6-a5f2-cdee48ad26a7",
                                "type": "BOOLEAN",
                                "name": "isVisible",
                                "label": "Visible",
                                "description": "View Field visibility",
                                "icon": "IconEye",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "39f87361-1e7b-476a-8691-2f8e56469a58",
                                "type": "UUID",
                                "name": "viewId",
                                "label": "View id (foreign key)",
                                "description": "View Field related view id foreign key",
                                "icon": "IconLayoutCollage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "bc8c05de-2f8f-4845-a4a9-ebe45e546437",
                                "type": "FULL_NAME",
                                "name": "name",
                                "label": "Name",
                                "description": "Workspace member name",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "56ef402e-1293-468e-b344-63039ea073f8",
                                "type": "TEXT",
                                "name": "colorScheme",
                                "label": "Color Scheme",
                                "description": "Preferred color scheme",
                                "icon": "IconColorSwatch",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "9d4254f5-4205-4e7c-817f-615c96d42b13",
                                "type": "RELATION",
                                "name": "accountOwnerForCompanies",
                                "label": "Account Owner For Companies",
                                "description": "Account owner for companies",
                                "icon": "IconBriefcase",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "b33c4843-a92c-496a-aacf-2f96ad9d63f8",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "9d4254f5-4205-4e7c-817f-615c96d42b13",
                                        "name": "accountOwnerForCompanies"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "a6e55238-45c4-44d4-a07f-ee9b7eb9d9a7",
                                        "name": "accountOwner"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "b33c4843-a92c-496a-aacf-2f96ad9d63f8",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "a6e55238-45c4-44d4-a07f-ee9b7eb9d9a7",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "company",
                                        "namePlural": "companies",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "300a0627-556a-438d-aed1-cb47c3efdb24",
                                "type": "RELATION",
                                "name": "favorites",
                                "label": "Favorites",
                                "description": "Favorites linked to the workspace member",
                                "icon": "IconHeart",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "91b337dd-4f43-461f-a4e6-75cde5e006fa",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "300a0627-556a-438d-aed1-cb47c3efdb24",
                                        "name": "favorites"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "18dca64f-e99a-4804-8cce-1fdcda3cbdf3",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "2bfae874-00a3-4fc1-bb07-c81686f150b5",
                                        "name": "workspaceMember"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "91b337dd-4f43-461f-a4e6-75cde5e006fa",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "2bfae874-00a3-4fc1-bb07-c81686f150b5",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "18dca64f-e99a-4804-8cce-1fdcda3cbdf3",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "799652ff-ad86-44c9-aab7-7d01cc64cb3e",
                                "type": "TEXT",
                                "name": "locale",
                                "label": "Language",
                                "description": "Preferred language",
                                "icon": "IconLanguage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "f0176ccd-9361-4c73-a39e-c872fb851e4d",
                                "type": "RELATION",
                                "name": "calendarEventParticipants",
                                "label": "Calendar Event Participants",
                                "description": "Calendar Event Participants",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "1d580380-b783-45cb-ac7d-f2ddc2595176",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "f0176ccd-9361-4c73-a39e-c872fb851e4d",
                                        "name": "calendarEventParticipants"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "cef36472-b79e-45bc-aff0-60157b9807db",
                                        "nameSingular": "calendarEventParticipant",
                                        "namePlural": "calendarEventParticipants"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "d4d4dc14-b704-4c6c-b820-ce2a9f8a7029",
                                        "name": "workspaceMember"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "1d580380-b783-45cb-ac7d-f2ddc2595176",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "d4d4dc14-b704-4c6c-b820-ce2a9f8a7029",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "cef36472-b79e-45bc-aff0-60157b9807db",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "calendarEventParticipant",
                                        "namePlural": "calendarEventParticipants",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "b326f05c-ea3c-4f7c-8077-16b5266c33ca",
                                "type": "RELATION",
                                "name": "assignedActivities",
                                "label": "Assigned activities",
                                "description": "Activities assigned to the workspace member",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "92229a2f-b5bc-4f0c-a1f7-d45ce6a79a3d",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "b326f05c-ea3c-4f7c-8077-16b5266c33ca",
                                        "name": "assignedActivities"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c9a281d4-f7a1-4a59-89c4-80f7184904d3",
                                        "nameSingular": "activity",
                                        "namePlural": "activities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "f7807f8d-790b-4742-8bfd-b7a9d385c26b",
                                        "name": "assignee"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "92229a2f-b5bc-4f0c-a1f7-d45ce6a79a3d",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "f7807f8d-790b-4742-8bfd-b7a9d385c26b",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c9a281d4-f7a1-4a59-89c4-80f7184904d3",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "activity",
                                        "namePlural": "activities",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "10e23df6-55ba-4397-bab1-ad70f2f7ceab",
                                "type": "RELATION",
                                "name": "authoredActivities",
                                "label": "Authored activities",
                                "description": "Activities created by the workspace member",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "457d63d3-63c3-4658-a2f8-5efd6d1ce6af",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "10e23df6-55ba-4397-bab1-ad70f2f7ceab",
                                        "name": "authoredActivities"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c9a281d4-f7a1-4a59-89c4-80f7184904d3",
                                        "nameSingular": "activity",
                                        "namePlural": "activities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5b49f674-012b-468a-a3ba-b7f7f46f39e6",
                                        "name": "author"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "457d63d3-63c3-4658-a2f8-5efd6d1ce6af",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "5b49f674-012b-468a-a3ba-b7f7f46f39e6",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c9a281d4-f7a1-4a59-89c4-80f7184904d3",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "activity",
                                        "namePlural": "activities",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "b57b985a-5566-47e7-9b1d-626ecaffa748",
                                "type": "RELATION",
                                "name": "auditLogs",
                                "label": "Audit Logs",
                                "description": "Audit Logs linked to the workspace member",
                                "icon": "IconTimelineEvent",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "2eed98d4-3672-4bfb-8e60-337943d3711b",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "b57b985a-5566-47e7-9b1d-626ecaffa748",
                                        "name": "auditLogs"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "68e8546d-b890-4fb2-a289-2c33f1fbcd75",
                                        "nameSingular": "auditLog",
                                        "namePlural": "auditLogs"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "591b25a5-b235-4574-92a4-da76589cf830",
                                        "name": "workspaceMember"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "2eed98d4-3672-4bfb-8e60-337943d3711b",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "591b25a5-b235-4574-92a4-da76589cf830",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "68e8546d-b890-4fb2-a289-2c33f1fbcd75",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "auditLog",
                                        "namePlural": "auditLogs",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "94f3dba7-ed3d-452d-b4ca-0409d4344122",
                                "type": "TEXT",
                                "name": "avatarUrl",
                                "label": "Avatar Url",
                                "description": "Workspace member avatar",
                                "icon": "IconFileUpload",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "4a20407c-da21-4434-94f7-831b633409c3",
                                "type": "RELATION",
                                "name": "authoredAttachments",
                                "label": "Authored attachments",
                                "description": "Attachments created by the workspace member",
                                "icon": "IconFileImport",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "20addc0e-14d8-47fb-8403-7c2acda22e2f",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "4a20407c-da21-4434-94f7-831b633409c3",
                                        "name": "authoredAttachments"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0ab14e53-605a-4863-8af4-78a5c54fd603",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "3054f5f4-c8fc-4b93-8050-79cf31ee0a39",
                                        "name": "author"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "20addc0e-14d8-47fb-8403-7c2acda22e2f",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "3054f5f4-c8fc-4b93-8050-79cf31ee0a39",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0ab14e53-605a-4863-8af4-78a5c54fd603",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "8ff49085-d3dd-47bb-9f66-517995123167",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "65ead1ea-1763-411f-8706-425c8eb34e74",
                                "type": "UUID",
                                "name": "userId",
                                "label": "User Id",
                                "description": "Associated User Id",
                                "icon": "IconCircleUsers",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "71bb93ea-d3ea-4445-a1c3-81b171a68f54",
                                "type": "TEXT",
                                "name": "userEmail",
                                "label": "User Email",
                                "description": "Related user email address",
                                "icon": "IconMail",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "db387708-a1c3-4368-a4f5-fac4bd24d30d",
                                "type": "RELATION",
                                "name": "timelineActivities",
                                "label": "Events",
                                "description": "Events linked to the workspace member",
                                "icon": "IconTimelineEvent",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "59c3ea0c-9b54-49c2-997b-5e3085facd40",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "db387708-a1c3-4368-a4f5-fac4bd24d30d",
                                        "name": "timelineActivities"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "3cc410c9-41fd-4722-8a92-cbe798f89d2a",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "8df3865b-77d2-45a4-88ab-50f88ed221cd",
                                        "name": "workspaceMember"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "59c3ea0c-9b54-49c2-997b-5e3085facd40",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "8df3865b-77d2-45a4-88ab-50f88ed221cd",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "3cc410c9-41fd-4722-8a92-cbe798f89d2a",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "2a9fe753-08bb-489a-ac6b-60f896f32ef8",
                                "type": "RELATION",
                                "name": "messageParticipants",
                                "label": "Message Participants",
                                "description": "Message Participants",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "8a482cc2-bf97-4707-978f-21b8fd10a1d4",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "2a9fe753-08bb-489a-ac6b-60f896f32ef8",
                                        "name": "messageParticipants"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "bcda7a99-9b9e-4fec-9ed6-ef880da81cf1",
                                        "nameSingular": "messageParticipant",
                                        "namePlural": "messageParticipants"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "e7e4dd30-93ac-47a2-9a98-4acddaffacda",
                                        "name": "workspaceMember"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "8a482cc2-bf97-4707-978f-21b8fd10a1d4",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "e7e4dd30-93ac-47a2-9a98-4acddaffacda",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "bcda7a99-9b9e-4fec-9ed6-ef880da81cf1",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "messageParticipant",
                                        "namePlural": "messageParticipants",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "667d1935-2162-40fd-920c-6c26da5f9148",
                                "type": "RELATION",
                                "name": "connectedAccounts",
                                "label": "Connected accounts",
                                "description": "Connected accounts",
                                "icon": "IconAt",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "10e3e707-b021-4b00-98ec-391c198fd91e",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "667d1935-2162-40fd-920c-6c26da5f9148",
                                        "name": "connectedAccounts"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "9a5b559e-86ab-4189-8edd-8f8c6b6cd474",
                                        "nameSingular": "connectedAccount",
                                        "namePlural": "connectedAccounts"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "12495fbd-6344-4ac3-a92a-9ebac34bd8e5",
                                        "name": "accountOwner"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "10e3e707-b021-4b00-98ec-391c198fd91e",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "12495fbd-6344-4ac3-a92a-9ebac34bd8e5",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "9a5b559e-86ab-4189-8edd-8f8c6b6cd474",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "connectedAccount",
                                        "namePlural": "connectedAccounts",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "d429871c-08ba-4b6e-bb12-4bcd5e6b5b52",
                                "type": "RELATION",
                                "name": "authoredComments",
                                "label": "Authored comments",
                                "description": "Authored comments",
                                "icon": "IconComment",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "f67757f3-c57b-4edf-9ce0-8f7bf93cdaca",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "d429871c-08ba-4b6e-bb12-4bcd5e6b5b52",
                                        "name": "authoredComments"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c400eb95-369e-49ff-8b3e-920fd561bc39",
                                        "nameSingular": "comment",
                                        "namePlural": "comments"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "2f867595-dc61-4ec2-b34c-5a07d6329ae7",
                                        "name": "author"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "f67757f3-c57b-4edf-9ce0-8f7bf93cdaca",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "2f867595-dc61-4ec2-b34c-5a07d6329ae7",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c400eb95-369e-49ff-8b3e-920fd561bc39",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "comment",
                                        "namePlural": "comments",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "b4dd981c-d5e5-4695-9d7d-e806abcabc01",
                                "type": "RELATION",
                                "name": "blocklist",
                                "label": "Blocklist",
                                "description": "Blocklisted handles",
                                "icon": "IconForbid2",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "91c623d1-5d99-4b4a-b32f-d79581bb7842",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "b4dd981c-d5e5-4695-9d7d-e806abcabc01",
                                        "name": "blocklist"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "ead7b6ea-59e5-47c8-ac50-6b7e8df62b48",
                                        "nameSingular": "blocklist",
                                        "namePlural": "blocklists"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "92212f36-abd9-4b54-ba41-b4fafedde8a2",
                                        "name": "workspaceMember"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "91c623d1-5d99-4b4a-b32f-d79581bb7842",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "92212f36-abd9-4b54-ba41-b4fafedde8a2",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "ead7b6ea-59e5-47c8-ac50-6b7e8df62b48",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "blocklist",
                                        "namePlural": "blocklists",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "36c38e15-ffeb-422b-95f5-ea0f85644dd3",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "e6a07531-fe4c-4375-b07e-95991e27d74a",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                "id": "50fb71e4-ba3e-4c98-892e-5b11761e69cf",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "4e66fa4f-3d28-4bff-9484-a9ca5690909a",
                                "type": "DATE_TIME",
                                "name": "closeDate",
                                "label": "Close date",
                                "description": "Opportunity close date",
                                "icon": "IconCalendarEvent",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "e9d6d538-2ef2-441c-a68f-3d2eff702720",
                                "type": "RELATION",
                                "name": "timelineActivities",
                                "label": "Timeline Activities",
                                "description": "Timeline Activities linked to the opportunity.",
                                "icon": "IconTimelineEvent",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "6eb0f888-53b6-4b61-972a-d966a7b5ba97",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "50fb71e4-ba3e-4c98-892e-5b11761e69cf",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "e9d6d538-2ef2-441c-a68f-3d2eff702720",
                                        "name": "timelineActivities"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "3cc410c9-41fd-4722-8a92-cbe798f89d2a",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "0aaf1a02-2d26-4c3d-a070-ee21c2cfd408",
                                        "name": "opportunity"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "6eb0f888-53b6-4b61-972a-d966a7b5ba97",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "0aaf1a02-2d26-4c3d-a070-ee21c2cfd408",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "3cc410c9-41fd-4722-8a92-cbe798f89d2a",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "13c3d6b3-132b-47ef-a308-2053091468c6",
                                "type": "UUID",
                                "name": "pointOfContactId",
                                "label": "Point of Contact id (foreign key)",
                                "description": "Opportunity point of contact id foreign key",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "0b05c553-794b-4948-94c7-f2d4cdfdad2f",
                                "type": "RELATION",
                                "name": "activityTargets",
                                "label": "Activities",
                                "description": "Activities tied to the opportunity",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "d2fc32f9-b1ea-491f-bb1e-b10eeca69546",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "50fb71e4-ba3e-4c98-892e-5b11761e69cf",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "0b05c553-794b-4948-94c7-f2d4cdfdad2f",
                                        "name": "activityTargets"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e9ea869d-b7fd-46f3-8c0d-0518ad2a21ca",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "fb3001a8-4590-4c42-baab-31fb943361e1",
                                        "name": "opportunity"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "d2fc32f9-b1ea-491f-bb1e-b10eeca69546",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "fb3001a8-4590-4c42-baab-31fb943361e1",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e9ea869d-b7fd-46f3-8c0d-0518ad2a21ca",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "41303dc1-edcd-430a-840d-7809becdc85b",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "88329253-0a01-4630-b9fc-56c1c622cbf0",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "03be65f3-d130-406c-9e36-9bf74141c398",
                                "type": "RELATION",
                                "name": "pointOfContact",
                                "label": "Point of Contact",
                                "description": "Opportunity point of contact",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "0f6e2b8c-e8a7-4176-abcc-3d6ca333a53f",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "50fb71e4-ba3e-4c98-892e-5b11761e69cf",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "03be65f3-d130-406c-9e36-9bf74141c398",
                                        "name": "pointOfContact"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "4e0c2529-6d91-47ea-bb74-65731f131a73",
                                        "name": "pointOfContactForOpportunities"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "0f6e2b8c-e8a7-4176-abcc-3d6ca333a53f",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "4e0c2529-6d91-47ea-bb74-65731f131a73",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "4d2d4e80-f232-4947-bca3-e43a3a2585a0",
                                "type": "POSITION",
                                "name": "position",
                                "label": "Position",
                                "description": "Opportunity record position",
                                "icon": "IconHierarchy2",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "984712de-b628-4b7e-beac-d81180dac8c6",
                                "type": "SELECT",
                                "name": "stage",
                                "label": "Stage",
                                "description": "Opportunity stage",
                                "icon": "IconProgressCheck",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": "'NEW'",
                                "options": [
                                    {
                                        "id": "30a7bdd1-a6ba-4b9e-bd72-42c325d6d1b7",
                                        "color": "red",
                                        "label": "New",
                                        "value": "NEW",
                                        "position": 0
                                    },
                                    {
                                        "id": "1256dd3c-e9a1-47c8-bae6-dfd5c6926301",
                                        "color": "purple",
                                        "label": "Screening",
                                        "value": "SCREENING",
                                        "position": 1
                                    },
                                    {
                                        "id": "4a9e5c0d-6635-48e6-b084-31a6f67b994c",
                                        "color": "sky",
                                        "label": "Meeting",
                                        "value": "MEETING",
                                        "position": 2
                                    },
                                    {
                                        "id": "d6940b42-c4e4-449f-a9d1-2380fd60b5bb",
                                        "color": "turquoise",
                                        "label": "Proposal",
                                        "value": "PROPOSAL",
                                        "position": 3
                                    },
                                    {
                                        "id": "965623d5-f2c8-415b-8614-bda3f7b33dd2",
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
                                "id": "f2c8b838-7f41-4aaf-9f32-7642a85240eb",
                                "type": "TEXT",
                                "name": "name",
                                "label": "Name",
                                "description": "The opportunity name",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "f7b0e41f-6a6d-415e-a4fa-d06b3acdb345",
                                "type": "CURRENCY",
                                "name": "amount",
                                "label": "Amount",
                                "description": "Opportunity amount",
                                "icon": "IconCurrencyDollar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "fc55b7dc-b9c5-4885-bbb1-64ed35fd6196",
                                "type": "UUID",
                                "name": "companyId",
                                "label": "Company id (foreign key)",
                                "description": "Opportunity company id foreign key",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "5f1a4f6d-ef0e-40e0-bcb8-aedbda2a5168",
                                "type": "RELATION",
                                "name": "favorites",
                                "label": "Favorites",
                                "description": "Favorites linked to the opportunity",
                                "icon": "IconHeart",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "cf1ed259-046e-4dcf-b1bd-fd56adfad059",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "50fb71e4-ba3e-4c98-892e-5b11761e69cf",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5f1a4f6d-ef0e-40e0-bcb8-aedbda2a5168",
                                        "name": "favorites"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "18dca64f-e99a-4804-8cce-1fdcda3cbdf3",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "315e8210-1e06-4a02-94b5-dc7187f787b3",
                                        "name": "opportunity"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "cf1ed259-046e-4dcf-b1bd-fd56adfad059",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "315e8210-1e06-4a02-94b5-dc7187f787b3",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "18dca64f-e99a-4804-8cce-1fdcda3cbdf3",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "f5800c31-ef57-4902-9a99-608dc1484583",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "d5659817-7eb4-44b1-aaa1-ece6ad03f178",
                                "type": "TEXT",
                                "name": "probability",
                                "label": "Probability",
                                "description": "Opportunity probability",
                                "icon": "IconProgressCheck",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": "'0'",
                                "options": null,
                                "relationDefinition": null,
                                "fromRelationMetadata": null,
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "923ec596-43f2-4b1f-94ee-3fe295811a33",
                                "type": "RELATION",
                                "name": "company",
                                "label": "Company",
                                "description": "Opportunity company",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "06e47e58-a909-4229-b695-5ab6517270d3",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "50fb71e4-ba3e-4c98-892e-5b11761e69cf",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "923ec596-43f2-4b1f-94ee-3fe295811a33",
                                        "name": "company"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "b4304d6f-96e4-4db2-9526-1797e54ce5ef",
                                        "name": "opportunities"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "06e47e58-a909-4229-b695-5ab6517270d3",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "b4304d6f-96e4-4db2-9526-1797e54ce5ef",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "513c3bb8-645a-4cc5-ad9f-4e34f99fd663",
                                "type": "RELATION",
                                "name": "attachments",
                                "label": "Attachments",
                                "description": "Attachments linked to the opportunity",
                                "icon": "IconFileImport",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "0448ff23-f80b-4da0-b674-903772c1010b",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "50fb71e4-ba3e-4c98-892e-5b11761e69cf",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "513c3bb8-645a-4cc5-ad9f-4e34f99fd663",
                                        "name": "attachments"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0ab14e53-605a-4863-8af4-78a5c54fd603",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "acfeed9f-e983-4ac9-b495-e5f69e9ac8ac",
                                        "name": "opportunity"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "0448ff23-f80b-4da0-b674-903772c1010b",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "acfeed9f-e983-4ac9-b495-e5f69e9ac8ac",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0ab14e53-605a-4863-8af4-78a5c54fd603",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
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
                "id": "3cc410c9-41fd-4722-8a92-cbe798f89d2a",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "b985cc74-079f-402a-be76-8a7f1c856b86",
                                "type": "UUID",
                                "name": "linkedRecordId",
                                "label": "Linked Record id",
                                "description": "Linked Record id",
                                "icon": "IconAbc",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "ecfbe0d2-65a1-423f-a63a-986f6bfbe2e9",
                                "type": "RELATION",
                                "name": "company",
                                "label": "Company",
                                "description": "Event company",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "96eb97e1-c525-4fcc-8ff6-9fc1fa24632d",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "3cc410c9-41fd-4722-8a92-cbe798f89d2a",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "ecfbe0d2-65a1-423f-a63a-986f6bfbe2e9",
                                        "name": "company"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "efcb7630-316b-4bac-bea5-6628bc256f8d",
                                        "name": "timelineActivities"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "96eb97e1-c525-4fcc-8ff6-9fc1fa24632d",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "efcb7630-316b-4bac-bea5-6628bc256f8d",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "28365e27-32d4-433c-8b3e-31df643611ae",
                                "type": "UUID",
                                "name": "personId",
                                "label": "Person id (foreign key)",
                                "description": "Event person id foreign key",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "84672cd2-f23e-4647-9a32-12b7cd367825",
                                "type": "UUID",
                                "name": "linkedObjectMetadataId",
                                "label": "Linked Object Metadata Id",
                                "description": "inked Object Metadata Id",
                                "icon": "IconAbc",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "1b615c2c-a2c1-45e4-a183-203a45d79fd3",
                                "type": "TEXT",
                                "name": "linkedRecordCachedName",
                                "label": "Linked Record cached name",
                                "description": "Cached record name",
                                "icon": "IconAbc",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "b295475a-4649-45b6-a62c-3bcf4ac3a53e",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "2d6dc047-92f9-4d32-b444-18d530aff360",
                                "type": "UUID",
                                "name": "companyId",
                                "label": "Company id (foreign key)",
                                "description": "Event company id foreign key",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "31756484-4f28-4c29-bc89-4b75641bd082",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "7a195fa4-3401-4f97-8caa-200a26bb0d18",
                                "type": "TEXT",
                                "name": "name",
                                "label": "Event name",
                                "description": "Event name",
                                "icon": "IconAbc",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "41050296-a09f-403a-b330-fdde9dfaa2ee",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "3a2d002b-5d0f-4424-9136-ead459344186",
                                "type": "UUID",
                                "name": "opportunityId",
                                "label": "Opportunity id (foreign key)",
                                "description": "Event opportunity id foreign key",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "8df3865b-77d2-45a4-88ab-50f88ed221cd",
                                "type": "RELATION",
                                "name": "workspaceMember",
                                "label": "Workspace Member",
                                "description": "Event workspace member",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "59c3ea0c-9b54-49c2-997b-5e3085facd40",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "3cc410c9-41fd-4722-8a92-cbe798f89d2a",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "8df3865b-77d2-45a4-88ab-50f88ed221cd",
                                        "name": "workspaceMember"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "db387708-a1c3-4368-a4f5-fac4bd24d30d",
                                        "name": "timelineActivities"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "59c3ea0c-9b54-49c2-997b-5e3085facd40",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "db387708-a1c3-4368-a4f5-fac4bd24d30d",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "399c776f-160c-4ce5-a212-2eb9fce2f3ad",
                                "type": "DATE_TIME",
                                "name": "happensAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "a2952e3f-514b-4753-92ba-b54f7d150f41",
                                "type": "UUID",
                                "name": "workspaceMemberId",
                                "label": "Workspace Member id (foreign key)",
                                "description": "Event workspace member id foreign key",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "1ebd6cf2-6f15-4e1a-986e-b2b1411b3dc1",
                                "type": "RAW_JSON",
                                "name": "properties",
                                "label": "Event details",
                                "description": "Json value for event details",
                                "icon": "IconListDetails",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "0aaf1a02-2d26-4c3d-a070-ee21c2cfd408",
                                "type": "RELATION",
                                "name": "opportunity",
                                "label": "Opportunity",
                                "description": "Event opportunity",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "6eb0f888-53b6-4b61-972a-d966a7b5ba97",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "3cc410c9-41fd-4722-8a92-cbe798f89d2a",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "0aaf1a02-2d26-4c3d-a070-ee21c2cfd408",
                                        "name": "opportunity"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "50fb71e4-ba3e-4c98-892e-5b11761e69cf",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "e9d6d538-2ef2-441c-a68f-3d2eff702720",
                                        "name": "timelineActivities"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "6eb0f888-53b6-4b61-972a-d966a7b5ba97",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "e9d6d538-2ef2-441c-a68f-3d2eff702720",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "50fb71e4-ba3e-4c98-892e-5b11761e69cf",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "1e624994-6cc5-467a-9e26-5bbce9efb9e1",
                                "type": "RELATION",
                                "name": "person",
                                "label": "Person",
                                "description": "Event person",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "78ce5c81-3678-42a7-83c8-f6e7c3d5f965",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "3cc410c9-41fd-4722-8a92-cbe798f89d2a",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "1e624994-6cc5-467a-9e26-5bbce9efb9e1",
                                        "name": "person"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "cd0c22ad-6b98-4290-bb16-4f1a1509904b",
                                        "name": "timelineActivities"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "78ce5c81-3678-42a7-83c8-f6e7c3d5f965",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "cd0c22ad-6b98-4290-bb16-4f1a1509904b",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "person",
                                        "namePlural": "people",
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
                "id": "2563cff2-8257-4f84-b76f-300f7a413853",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "2894b1df-48f6-4938-a0ff-ffbc4533388b",
                                "type": "TEXT",
                                "name": "targetUrl",
                                "label": "Target Url",
                                "description": "Webhook target url",
                                "icon": "IconLink",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "1fd99109-338f-40de-8898-62a2bda2381e",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "cac87267-6914-402d-9030-2890237b8743",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "ed9e5a39-060b-4217-a20f-4a8045fd327c",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "84c76c5c-478d-4780-8694-8815727acbc5",
                                "type": "TEXT",
                                "name": "operation",
                                "label": "Operation",
                                "description": "Webhook operation",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                "id": "21d73f78-51c8-4fb8-8433-6114c9e671d0",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "3fc09be3-8206-42e1-a577-f0f114cc30a4",
                                "type": "TEXT",
                                "name": "displayValue",
                                "label": "Display Value",
                                "description": "View Filter Display Value",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "8a38cee5-64d0-4db6-b7e0-8377161bc2b3",
                                "type": "RELATION",
                                "name": "view",
                                "label": "View",
                                "description": "View Filter related view",
                                "icon": "IconLayoutCollage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "c94f1341-3cd1-43d8-9262-ad316fb59c10",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "21d73f78-51c8-4fb8-8433-6114c9e671d0",
                                        "nameSingular": "viewFilter",
                                        "namePlural": "viewFilters"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "8a38cee5-64d0-4db6-b7e0-8377161bc2b3",
                                        "name": "view"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e881ed81-8683-478a-95fa-8eb430056d42",
                                        "nameSingular": "view",
                                        "namePlural": "views"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "8f680bc3-91cf-42c2-b7f7-44943af6a223",
                                        "name": "viewFilters"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "c94f1341-3cd1-43d8-9262-ad316fb59c10",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "8f680bc3-91cf-42c2-b7f7-44943af6a223",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e881ed81-8683-478a-95fa-8eb430056d42",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "a4b9bf28-1059-41bb-aa5b-79b6540f7c8c",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "038a08d0-2d2e-406d-b326-b4628ecedf8b",
                                "type": "UUID",
                                "name": "viewId",
                                "label": "View id (foreign key)",
                                "description": "View Filter related view id foreign key",
                                "icon": "IconLayoutCollage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "ff0f6802-234f-4bdb-aaa1-456f8adec5a4",
                                "type": "UUID",
                                "name": "fieldMetadataId",
                                "label": "Field Metadata Id",
                                "description": "View Filter target field",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "eb676c20-98e2-4aaa-a979-a6b349defcad",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "95333a2f-86fb-4c15-9606-c77c6c14fe85",
                                "type": "TEXT",
                                "name": "value",
                                "label": "Value",
                                "description": "View Filter value",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "21cdea4c-ffea-4cd7-afdf-fe622d2eeb2e",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "4de7108b-e4b1-47a5-afe3-ec64d4dbf4bd",
                                "type": "TEXT",
                                "name": "operand",
                                "label": "Operand",
                                "description": "View Filter operand",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": "'Contains'",
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
                "id": "18dca64f-e99a-4804-8cce-1fdcda3cbdf3",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "204461c9-5537-4905-ba8c-3525061a9e4e",
                                "type": "NUMBER",
                                "name": "position",
                                "label": "Position",
                                "description": "Favorite position",
                                "icon": "IconList",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "2b7c9093-b1cc-4538-9498-857653cb1f0a",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "b5cc00dc-6d96-4911-b792-26850333ac8b",
                                "type": "UUID",
                                "name": "companyId",
                                "label": "Company id (foreign key)",
                                "description": "Favorite company id foreign key",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "315e8210-1e06-4a02-94b5-dc7187f787b3",
                                "type": "RELATION",
                                "name": "opportunity",
                                "label": "Opportunity",
                                "description": "Favorite opportunity",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "cf1ed259-046e-4dcf-b1bd-fd56adfad059",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "18dca64f-e99a-4804-8cce-1fdcda3cbdf3",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "315e8210-1e06-4a02-94b5-dc7187f787b3",
                                        "name": "opportunity"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "50fb71e4-ba3e-4c98-892e-5b11761e69cf",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5f1a4f6d-ef0e-40e0-bcb8-aedbda2a5168",
                                        "name": "favorites"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "cf1ed259-046e-4dcf-b1bd-fd56adfad059",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "5f1a4f6d-ef0e-40e0-bcb8-aedbda2a5168",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "50fb71e4-ba3e-4c98-892e-5b11761e69cf",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "b3a8eb11-8daf-4190-a2fc-9fb176272430",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "3209baa9-430c-4246-8b20-28ff2350472b",
                                "type": "UUID",
                                "name": "workspaceMemberId",
                                "label": "Workspace Member id (foreign key)",
                                "description": "Favorite workspace member id foreign key",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "11c54292-f882-4160-b597-61e02ccdb724",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "36fe7c92-50be-4896-ba57-0cd8a187ab1d",
                                "type": "RELATION",
                                "name": "person",
                                "label": "Person",
                                "description": "Favorite person",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "c307b429-1493-46fc-aa62-0b2a1986b439",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "18dca64f-e99a-4804-8cce-1fdcda3cbdf3",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "36fe7c92-50be-4896-ba57-0cd8a187ab1d",
                                        "name": "person"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "7de7a579-9ec9-42d4-abb1-41923e074f93",
                                        "name": "favorites"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "c307b429-1493-46fc-aa62-0b2a1986b439",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "7de7a579-9ec9-42d4-abb1-41923e074f93",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "474674fc-335f-464f-8a6e-6d83aeca399b",
                                "type": "UUID",
                                "name": "personId",
                                "label": "Person id (foreign key)",
                                "description": "Favorite person id foreign key",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "9d6b5a8d-0066-4865-95f2-ef69a045a7e0",
                                "type": "RELATION",
                                "name": "company",
                                "label": "Company",
                                "description": "Favorite company",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "8a51d714-0edf-471b-970f-73f298109b0a",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "18dca64f-e99a-4804-8cce-1fdcda3cbdf3",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "9d6b5a8d-0066-4865-95f2-ef69a045a7e0",
                                        "name": "company"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "3fb2d705-1936-45f2-b63b-19752f0d02d8",
                                        "name": "favorites"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "8a51d714-0edf-471b-970f-73f298109b0a",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "3fb2d705-1936-45f2-b63b-19752f0d02d8",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "6a1bf642-98f0-42ab-b4b6-05042d1a78df",
                                "type": "UUID",
                                "name": "opportunityId",
                                "label": "Opportunity id (foreign key)",
                                "description": "Favorite opportunity id foreign key",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "2bfae874-00a3-4fc1-bb07-c81686f150b5",
                                "type": "RELATION",
                                "name": "workspaceMember",
                                "label": "Workspace Member",
                                "description": "Favorite workspace member",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "91b337dd-4f43-461f-a4e6-75cde5e006fa",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "18dca64f-e99a-4804-8cce-1fdcda3cbdf3",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "2bfae874-00a3-4fc1-bb07-c81686f150b5",
                                        "name": "workspaceMember"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "300a0627-556a-438d-aed1-cb47c3efdb24",
                                        "name": "favorites"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "91b337dd-4f43-461f-a4e6-75cde5e006fa",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "300a0627-556a-438d-aed1-cb47c3efdb24",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers",
                                        "isSystem": true,
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
                "id": "0ab14e53-605a-4863-8af4-78a5c54fd603",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "c8b540be-c6ba-41c6-a515-8ccad99dc504",
                                "type": "UUID",
                                "name": "opportunityId",
                                "label": "Opportunity id (foreign key)",
                                "description": "Attachment opportunity id foreign key",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "a328b105-8e39-40eb-93b1-8d3c6dad1c56",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "d143fae3-9f2d-44b3-bd19-e79f9230d59d",
                                "type": "UUID",
                                "name": "activityId",
                                "label": "Activity id (foreign key)",
                                "description": "Attachment activity id foreign key",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "72f1a5ee-afe6-4a14-90fa-7e0529936ede",
                                "type": "TEXT",
                                "name": "name",
                                "label": "Name",
                                "description": "Attachment name",
                                "icon": "IconFileUpload",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "a05f375e-57e4-4167-b881-e724642038b4",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "ae9a6da4-e7bf-4f46-9615-56d28974bf3b",
                                "type": "RELATION",
                                "name": "company",
                                "label": "Company",
                                "description": "Attachment company",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "f3476f36-2d30-4fc3-a91f-5cc3d70c6878",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0ab14e53-605a-4863-8af4-78a5c54fd603",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "ae9a6da4-e7bf-4f46-9615-56d28974bf3b",
                                        "name": "company"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "88bbc25f-24d7-4fb4-b797-924e72aa61c7",
                                        "name": "attachments"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "f3476f36-2d30-4fc3-a91f-5cc3d70c6878",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "88bbc25f-24d7-4fb4-b797-924e72aa61c7",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "479accd3-360f-4850-b003-a4ec5399e5b5",
                                "type": "UUID",
                                "name": "authorId",
                                "label": "Author id (foreign key)",
                                "description": "Attachment author id foreign key",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "acfeed9f-e983-4ac9-b495-e5f69e9ac8ac",
                                "type": "RELATION",
                                "name": "opportunity",
                                "label": "Opportunity",
                                "description": "Attachment opportunity",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "0448ff23-f80b-4da0-b674-903772c1010b",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0ab14e53-605a-4863-8af4-78a5c54fd603",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "acfeed9f-e983-4ac9-b495-e5f69e9ac8ac",
                                        "name": "opportunity"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "50fb71e4-ba3e-4c98-892e-5b11761e69cf",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "513c3bb8-645a-4cc5-ad9f-4e34f99fd663",
                                        "name": "attachments"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "0448ff23-f80b-4da0-b674-903772c1010b",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "513c3bb8-645a-4cc5-ad9f-4e34f99fd663",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "50fb71e4-ba3e-4c98-892e-5b11761e69cf",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "fc91b8fb-ea4a-4f99-82fe-9ea5b7b71dd4",
                                "type": "UUID",
                                "name": "personId",
                                "label": "Person id (foreign key)",
                                "description": "Attachment person id foreign key",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "3054f5f4-c8fc-4b93-8050-79cf31ee0a39",
                                "type": "RELATION",
                                "name": "author",
                                "label": "Author",
                                "description": "Attachment author",
                                "icon": "IconCircleUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "20addc0e-14d8-47fb-8403-7c2acda22e2f",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0ab14e53-605a-4863-8af4-78a5c54fd603",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "3054f5f4-c8fc-4b93-8050-79cf31ee0a39",
                                        "name": "author"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "4a20407c-da21-4434-94f7-831b633409c3",
                                        "name": "authoredAttachments"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "20addc0e-14d8-47fb-8403-7c2acda22e2f",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "4a20407c-da21-4434-94f7-831b633409c3",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "8e70c588-fe11-4e50-9c73-3ae3d4ed0ce4",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "8a2945c3-ffac-4e60-aa1d-97478d8ec182",
                                "type": "TEXT",
                                "name": "type",
                                "label": "Type",
                                "description": "Attachment type",
                                "icon": "IconList",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "a7bffb60-44aa-4ec8-93f6-58ea67339e44",
                                "type": "RELATION",
                                "name": "person",
                                "label": "Person",
                                "description": "Attachment person",
                                "icon": "IconUser",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "f6f17af4-a4f6-43bc-be46-24f7d82da592",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0ab14e53-605a-4863-8af4-78a5c54fd603",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "a7bffb60-44aa-4ec8-93f6-58ea67339e44",
                                        "name": "person"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "6812c05b-797f-420d-b904-0e15b763b1ac",
                                        "name": "attachments"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "f6f17af4-a4f6-43bc-be46-24f7d82da592",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "6812c05b-797f-420d-b904-0e15b763b1ac",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "4456e1e3-42c5-4083-8e86-258e1bc82f93",
                                "type": "UUID",
                                "name": "companyId",
                                "label": "Company id (foreign key)",
                                "description": "Attachment company id foreign key",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "9c55aa06-da6e-47ff-b447-3ef376cd98d5",
                                "type": "RELATION",
                                "name": "activity",
                                "label": "Activity",
                                "description": "Attachment activity",
                                "icon": "IconNotes",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "7b85a077-9552-4c4e-9dca-49fcc139c02f",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0ab14e53-605a-4863-8af4-78a5c54fd603",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "9c55aa06-da6e-47ff-b447-3ef376cd98d5",
                                        "name": "activity"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c9a281d4-f7a1-4a59-89c4-80f7184904d3",
                                        "nameSingular": "activity",
                                        "namePlural": "activities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "1eaea43e-3841-49b4-8063-d2c73f918e90",
                                        "name": "attachments"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "7b85a077-9552-4c4e-9dca-49fcc139c02f",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "1eaea43e-3841-49b4-8063-d2c73f918e90",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "c9a281d4-f7a1-4a59-89c4-80f7184904d3",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "a24ebd08-af49-4c41-beac-f4a82ffea62e",
                                "type": "TEXT",
                                "name": "fullPath",
                                "label": "Full path",
                                "description": "Attachment full path",
                                "icon": "IconLink",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "cee37cb1-1104-46ed-a104-cf6ac2acb7f5",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "5951b8c3-a7ad-4944-8871-0dd37019a7b5",
                                "type": "NUMBER",
                                "name": "employees",
                                "label": "Employees",
                                "description": "Number of employees in the company",
                                "icon": "IconUsers",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "88bbc25f-24d7-4fb4-b797-924e72aa61c7",
                                "type": "RELATION",
                                "name": "attachments",
                                "label": "Attachments",
                                "description": "Attachments linked to the company",
                                "icon": "IconFileImport",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "f3476f36-2d30-4fc3-a91f-5cc3d70c6878",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "88bbc25f-24d7-4fb4-b797-924e72aa61c7",
                                        "name": "attachments"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0ab14e53-605a-4863-8af4-78a5c54fd603",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "ae9a6da4-e7bf-4f46-9615-56d28974bf3b",
                                        "name": "company"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "f3476f36-2d30-4fc3-a91f-5cc3d70c6878",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "ae9a6da4-e7bf-4f46-9615-56d28974bf3b",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "0ab14e53-605a-4863-8af4-78a5c54fd603",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "attachment",
                                        "namePlural": "attachments",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "3fb2d705-1936-45f2-b63b-19752f0d02d8",
                                "type": "RELATION",
                                "name": "favorites",
                                "label": "Favorites",
                                "description": "Favorites linked to the company",
                                "icon": "IconHeart",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "8a51d714-0edf-471b-970f-73f298109b0a",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "3fb2d705-1936-45f2-b63b-19752f0d02d8",
                                        "name": "favorites"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "18dca64f-e99a-4804-8cce-1fdcda3cbdf3",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "9d6b5a8d-0066-4865-95f2-ef69a045a7e0",
                                        "name": "company"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "8a51d714-0edf-471b-970f-73f298109b0a",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "9d6b5a8d-0066-4865-95f2-ef69a045a7e0",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "18dca64f-e99a-4804-8cce-1fdcda3cbdf3",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "favorite",
                                        "namePlural": "favorites",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "1ee96415-1298-43aa-a1b5-bf92fc40b3fb",
                                "type": "UUID",
                                "name": "previousEmployeesId",
                                "label": "Previous employees Foreign Key",
                                "description": null,
                                "icon": null,
                                "isCustom": true,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:31:52.354Z",
                                "updatedAt": "2024-06-05T09:31:52.354Z",
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
                                "id": "41e3b101-d63e-4434-b820-7e394245ef0c",
                                "type": "UUID",
                                "name": "accountOwnerId",
                                "label": "Account Owner id (foreign key)",
                                "description": "Your team member responsible for managing the company account id foreign key",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "d54a40c2-b87a-4a53-b2eb-64c0a093d8c7",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "03d534cb-dd33-4ad8-b9c6-5d6c807265d3",
                                "type": "LINK",
                                "name": "linkedinLink",
                                "label": "Linkedin",
                                "description": "The company Linkedin account",
                                "icon": "IconBrandLinkedin",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": {
                                    "url": "''",
                                    "label": "''"
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
                                "id": "ee70892d-e183-4d06-9ddc-f6d6c00784eb",
                                "type": "CURRENCY",
                                "name": "annualRecurringRevenue",
                                "label": "ARR",
                                "description": "Annual Recurring Revenue: The actual or estimated annual revenue of the company",
                                "icon": "IconMoneybag",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "1f0a9a68-2656-4a17-b3d1-cc8cebe2eea6",
                                "type": "RELATION",
                                "name": "people",
                                "label": "People",
                                "description": "People linked to the company.",
                                "icon": "IconUsers",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "4c23197e-5d08-4bd4-a81e-409a17d6e72c",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "1f0a9a68-2656-4a17-b3d1-cc8cebe2eea6",
                                        "name": "people"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5d0746c4-c896-4643-b18c-6ad8e34896f6",
                                        "name": "company"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "4c23197e-5d08-4bd4-a81e-409a17d6e72c",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "5d0746c4-c896-4643-b18c-6ad8e34896f6",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "person",
                                        "namePlural": "people",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "b4304d6f-96e4-4db2-9526-1797e54ce5ef",
                                "type": "RELATION",
                                "name": "opportunities",
                                "label": "Opportunities",
                                "description": "Opportunities linked to the company.",
                                "icon": "IconTargetArrow",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "06e47e58-a909-4229-b695-5ab6517270d3",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "b4304d6f-96e4-4db2-9526-1797e54ce5ef",
                                        "name": "opportunities"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "50fb71e4-ba3e-4c98-892e-5b11761e69cf",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "923ec596-43f2-4b1f-94ee-3fe295811a33",
                                        "name": "company"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "06e47e58-a909-4229-b695-5ab6517270d3",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "923ec596-43f2-4b1f-94ee-3fe295811a33",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "50fb71e4-ba3e-4c98-892e-5b11761e69cf",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "opportunity",
                                        "namePlural": "opportunities",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "efcb7630-316b-4bac-bea5-6628bc256f8d",
                                "type": "RELATION",
                                "name": "timelineActivities",
                                "label": "Timeline Activities",
                                "description": "Timeline Activities linked to the company",
                                "icon": "IconIconTimelineEvent",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "96eb97e1-c525-4fcc-8ff6-9fc1fa24632d",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "efcb7630-316b-4bac-bea5-6628bc256f8d",
                                        "name": "timelineActivities"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "3cc410c9-41fd-4722-8a92-cbe798f89d2a",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "ecfbe0d2-65a1-423f-a63a-986f6bfbe2e9",
                                        "name": "company"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "96eb97e1-c525-4fcc-8ff6-9fc1fa24632d",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "ecfbe0d2-65a1-423f-a63a-986f6bfbe2e9",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "3cc410c9-41fd-4722-8a92-cbe798f89d2a",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "timelineActivity",
                                        "namePlural": "timelineActivities",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "4beb1ab6-4e16-4ab9-99da-8126ae7c6a89",
                                "type": "RELATION",
                                "name": "employeesLiked",
                                "label": "Employees liked",
                                "description": null,
                                "icon": "IconUser",
                                "isCustom": true,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:40:44.895Z",
                                "updatedAt": "2024-06-05T09:40:44.895Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "b438326e-06d5-46a9-830f-8972727e8f3b",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "4beb1ab6-4e16-4ab9-99da-8126ae7c6a89",
                                        "name": "employeesLiked"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "6ae952b7-afac-417f-b7df-16b51e8b3cc4",
                                        "name": "bestCompany"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "b438326e-06d5-46a9-830f-8972727e8f3b",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "6ae952b7-afac-417f-b7df-16b51e8b3cc4",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "person",
                                        "namePlural": "people",
                                        "isSystem": false,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "f85c3bfd-6514-4a4b-b2c1-a50b3cab0acc",
                                "type": "BOOLEAN",
                                "name": "idealCustomerProfile",
                                "label": "ICP",
                                "description": "Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you",
                                "icon": "IconTarget",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "21a578f4-1e7e-42f9-8966-14fadbf42b59",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "7e06d757-d56a-461e-adf2-cfe1f6b6f198",
                                "type": "TEXT",
                                "name": "name",
                                "label": "Name",
                                "description": "The company name",
                                "icon": "IconBuildingSkyscraper",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "5f3026e0-a199-44e7-b5d6-e3db935ed063",
                                "type": "RELATION",
                                "name": "activityTargets",
                                "label": "Activities",
                                "description": "Activities tied to the company",
                                "icon": "IconCheckbox",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "36d7bf30-3139-40e6-9d9c-8b0c06e95955",
                                    "direction": "ONE_TO_MANY",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5f3026e0-a199-44e7-b5d6-e3db935ed063",
                                        "name": "activityTargets"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e9ea869d-b7fd-46f3-8c0d-0518ad2a21ca",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "5bc29d63-1de7-4ecd-90bd-672970e96e9c",
                                        "name": "company"
                                    }
                                },
                                "fromRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "36d7bf30-3139-40e6-9d9c-8b0c06e95955",
                                    "relationType": "ONE_TO_MANY",
                                    "toFieldMetadataId": "5bc29d63-1de7-4ecd-90bd-672970e96e9c",
                                    "toObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e9ea869d-b7fd-46f3-8c0d-0518ad2a21ca",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
                                        "nameSingular": "activityTarget",
                                        "namePlural": "activityTargets",
                                        "isSystem": true,
                                        "isRemote": false
                                    }
                                },
                                "toRelationMetadata": null
                            }
                        },
                        {
                            "__typename": "fieldEdge",
                            "node": {
                                "__typename": "field",
                                "id": "a6e55238-45c4-44d4-a07f-ee9b7eb9d9a7",
                                "type": "RELATION",
                                "name": "accountOwner",
                                "label": "Account Owner",
                                "description": "Your team member responsible for managing the company account",
                                "icon": "IconUserCircle",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "b33c4843-a92c-496a-aacf-2f96ad9d63f8",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "a6e55238-45c4-44d4-a07f-ee9b7eb9d9a7",
                                        "name": "accountOwner"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "nameSingular": "workspaceMember",
                                        "namePlural": "workspaceMembers"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "9d4254f5-4205-4e7c-817f-615c96d42b13",
                                        "name": "accountOwnerForCompanies"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "b33c4843-a92c-496a-aacf-2f96ad9d63f8",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "9d4254f5-4205-4e7c-817f-615c96d42b13",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "51c40a07-7f4f-4a17-b5d8-f02146d08cbf",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "821f2a72-b26a-4d64-ad68-0e64d7189e82",
                                "type": "TEXT",
                                "name": "domainName",
                                "label": "Domain Name",
                                "description": "The company website URL. We use this url to fetch the company icon",
                                "icon": "IconLink",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "0dcbc0b7-2ec8-41eb-b2d6-39811beb68bf",
                                "type": "TEXT",
                                "name": "address",
                                "label": "Address",
                                "description": "The company address",
                                "icon": "IconMap",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "56df35a0-0802-4784-85df-05f8f0ed37a1",
                                "type": "RELATION",
                                "name": "previousEmployees",
                                "label": "Previous employees",
                                "description": null,
                                "icon": "IconUser",
                                "isCustom": true,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:31:52.354Z",
                                "updatedAt": "2024-06-05T09:31:52.354Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "586fb6fb-7938-41cb-9b61-06257caa4db9",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "067547a3-d9e7-47b2-beae-47e8d8bc63cd",
                                        "nameSingular": "company",
                                        "namePlural": "companies"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "56df35a0-0802-4784-85df-05f8f0ed37a1",
                                        "name": "previousEmployees"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "nameSingular": "person",
                                        "namePlural": "people"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "f3ec4aec-b966-4f39-bbcc-0f62acbd3573",
                                        "name": "testRelationHasWorkedInCompanies"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "586fb6fb-7938-41cb-9b61-06257caa4db9",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "f3ec4aec-b966-4f39-bbcc-0f62acbd3573",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "b59c2975-1963-4594-be08-116a785b812c",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "55a84c4c-746b-49da-82c9-c3434b2b7ea9",
                                "type": "LINK",
                                "name": "xLink",
                                "label": "X",
                                "description": "The company Twitter/X account",
                                "icon": "IconBrandX",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": false,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": {
                                    "url": "''",
                                    "label": "''"
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
                                "id": "f00b1ed5-93ce-4075-9cab-02bf38236f2a",
                                "type": "POSITION",
                                "name": "position",
                                "label": "Position",
                                "description": "Company record position",
                                "icon": "IconHierarchy2",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                "id": "00927c95-d590-4f85-b05b-1c7ac61ea6c6",
                "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                "createdAt": "2024-06-05T09:00:16.106Z",
                "updatedAt": "2024-06-05T09:00:16.106Z",
                "labelIdentifierFieldMetadataId": null,
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
                                "id": "bc034a50-88f3-4518-9200-100b78bfb690",
                                "type": "TEXT",
                                "name": "direction",
                                "label": "Direction",
                                "description": "View Sort direction",
                                "icon": null,
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "f2d911a0-2b5f-4640-b2fd-4766e44f0d13",
                                "type": "DATE_TIME",
                                "name": "updatedAt",
                                "label": "Update date",
                                "description": "Update date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "89cdc5aa-cbd6-4841-bf82-9065b066c3c8",
                                "type": "UUID",
                                "name": "viewId",
                                "label": "View id (foreign key)",
                                "description": "View Sort related view id foreign key",
                                "icon": "IconLayoutCollage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "6b12ea71-29d8-4b1a-aa75-ea9944e423bb",
                                "type": "UUID",
                                "name": "fieldMetadataId",
                                "label": "Field Metadata Id",
                                "description": "View Sort target field",
                                "icon": "IconTag",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "62603029-8195-4945-a178-708e6056696c",
                                "type": "RELATION",
                                "name": "view",
                                "label": "View",
                                "description": "View Sort related view",
                                "icon": "IconLayoutCollage",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": true,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
                                "defaultValue": null,
                                "options": null,
                                "fromRelationMetadata": null,
                                "relationDefinition": {
                                    "__typename": "RelationDefinition",
                                    "relationId": "9a3eb83a-a90c-489a-b61f-059e25366a67",
                                    "direction": "MANY_TO_ONE",
                                    "sourceObjectMetadata": {
                                        "__typename": "object",
                                        "id": "00927c95-d590-4f85-b05b-1c7ac61ea6c6",
                                        "nameSingular": "viewSort",
                                        "namePlural": "viewSorts"
                                    },
                                    "sourceFieldMetadata": {
                                        "__typename": "field",
                                        "id": "62603029-8195-4945-a178-708e6056696c",
                                        "name": "view"
                                    },
                                    "targetObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e881ed81-8683-478a-95fa-8eb430056d42",
                                        "nameSingular": "view",
                                        "namePlural": "views"
                                    },
                                    "targetFieldMetadata": {
                                        "__typename": "field",
                                        "id": "b9a8c390-347e-4be3-9751-728d94056914",
                                        "name": "viewSorts"
                                    }
                                },
                                "toRelationMetadata": {
                                    "__typename": "relation",
                                    "id": "9a3eb83a-a90c-489a-b61f-059e25366a67",
                                    "relationType": "ONE_TO_MANY",
                                    "fromFieldMetadataId": "b9a8c390-347e-4be3-9751-728d94056914",
                                    "fromObjectMetadata": {
                                        "__typename": "object",
                                        "id": "e881ed81-8683-478a-95fa-8eb430056d42",
                                        "dataSourceId": "3a6a9ab8-071a-44e8-98b9-8ff2a597103e",
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
                                "id": "9e60f270-7447-4ade-9414-c0feb38a2a47",
                                "type": "UUID",
                                "name": "id",
                                "label": "Id",
                                "description": "Id",
                                "icon": "Icon123",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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
                                "id": "34342def-eacb-40c5-a252-6e2046b5cbf0",
                                "type": "DATE_TIME",
                                "name": "createdAt",
                                "label": "Creation date",
                                "description": "Creation date",
                                "icon": "IconCalendar",
                                "isCustom": false,
                                "isActive": true,
                                "isSystem": true,
                                "isNullable": false,
                                "createdAt": "2024-06-05T09:00:16.106Z",
                                "updatedAt": "2024-06-05T09:00:16.106Z",
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

