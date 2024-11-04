import { FieldMetadataType, IndexType, ObjectMetadataItemsQuery, RelationDefinitionType } from '~/generated-metadata/graphql';

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
      "endCursor": "YXJyYXljb25uZWN0aW9uOjM1"
    },
    "edges": [
      {
        "__typename": "objectEdge",
        "node": {
          "__typename": "object",
          "id": "fad28eb7-a085-4917-93b3-579afd54f373",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "eb5556b8-c1a2-4878-99b8-5672899a4991",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "982e771e-36b5-43d7-8311-9e0147413c37",
                  "type": FieldMetadataType.Relation,
                  "name": "timelineActivities",
                  "label": "Timeline Activities",
                  "description": "Timeline activities linked to the version",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "db8b3588-fc2e-4809-83da-585d5a7c7b94",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "fad28eb7-a085-4917-93b3-579afd54f373",
                      "nameSingular": "workflowVersion",
                      "namePlural": "workflowVersions"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "982e771e-36b5-43d7-8311-9e0147413c37",
                      "name": "timelineActivities"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "082301c2-cd4d-4cdf-ab5a-98a71d493036",
                      "nameSingular": "timelineActivity",
                      "namePlural": "timelineActivities"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "971d7e6e-8ac5-45ee-8e8b-2fe38f3ee305",
                      "name": "workflowVersion"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "eb5556b8-c1a2-4878-99b8-5672899a4991",
                  "type": FieldMetadataType.Text,
                  "name": "name",
                  "label": "Name",
                  "description": "The workflow version name",
                  "icon": "IconSettingsAutomation",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "e7f40f5e-c67a-488b-aa6b-52769a752df7",
                  "type": FieldMetadataType.Relation,
                  "name": "favorites",
                  "label": "Favorites",
                  "description": "Favorites linked to the workflow version",
                  "icon": "IconHeart",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "2871058e-3264-4ab3-8b57-2f35cd39c676",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "fad28eb7-a085-4917-93b3-579afd54f373",
                      "nameSingular": "workflowVersion",
                      "namePlural": "workflowVersions"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "e7f40f5e-c67a-488b-aa6b-52769a752df7",
                      "name": "favorites"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "6d72fd09-755d-409b-8455-f74da70fa9c1",
                      "nameSingular": "favorite",
                      "namePlural": "favorites"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "efe57404-33f2-4fc6-9966-4eb401268efb",
                      "name": "workflowVersion"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "899c0065-cf52-4db7-91e0-c1b92367f348",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "0acb3058-0980-4c66-a04a-84b0992ddc9e",
                  "type": FieldMetadataType.Uuid,
                  "name": "workflowId",
                  "label": "Workflow id (foreign key)",
                  "description": "WorkflowVersion workflow id foreign key",
                  "icon": "IconSettingsAutomation",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "aa6e1d88-b8a9-4ffa-b7db-22cc28f1173b",
                  "type": FieldMetadataType.Relation,
                  "name": "runs",
                  "label": "Runs",
                  "description": "Workflow runs linked to the version.",
                  "icon": "IconRun",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "6ab227db-4062-4786-a249-05df1ba98190",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "fad28eb7-a085-4917-93b3-579afd54f373",
                      "nameSingular": "workflowVersion",
                      "namePlural": "workflowVersions"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "aa6e1d88-b8a9-4ffa-b7db-22cc28f1173b",
                      "name": "runs"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "87ef9245-2665-45db-8193-b6d216b5df50",
                      "nameSingular": "workflowRun",
                      "namePlural": "workflowRuns"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "28876be2-7039-438d-937b-2c0026413ee8",
                      "name": "workflowVersion"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "912d096f-9285-4dcc-8f5f-33745c47dd7f",
                  "type": FieldMetadataType.Position,
                  "name": "position",
                  "label": "Position",
                  "description": "Workflow version position",
                  "icon": "IconHierarchy2",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "00a18b73-d749-4be2-b804-682b9c368a38",
                  "type": FieldMetadataType.RawJson,
                  "name": "trigger",
                  "label": "Version trigger",
                  "description": "Json object to provide trigger",
                  "icon": "IconSettingsAutomation",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "2fb0d062-21fb-474e-8f52-c71ea56f2cce",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "7d349714-b35a-4aa6-8974-792e79f51e74",
                  "type": FieldMetadataType.Select,
                  "name": "status",
                  "label": "Version status",
                  "description": "The workflow version status",
                  "icon": "IconStatusChange",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "'DRAFT'",
                  "options": [
                    {
                      "id": "478ff8ba-744f-4ef8-b5b4-7c4d2a9e5959",
                      "color": "yellow",
                      "label": "Draft",
                      "value": "DRAFT",
                      "position": 0
                    },
                    {
                      "id": "2ded99ef-1eaf-4096-8f8c-9f635518c399",
                      "color": "green",
                      "label": "Active",
                      "value": "ACTIVE",
                      "position": 1
                    },
                    {
                      "id": "9c770342-99e0-4c65-ae01-c21b3c03bfd1",
                      "color": "red",
                      "label": "Deactivated",
                      "value": "DEACTIVATED",
                      "position": 2
                    },
                    {
                      "id": "e78a983d-5195-430f-84a1-09c2c80d9109",
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
                  "id": "ec9e0d24-a088-412b-a8d7-1dda6e366ae6",
                  "type": FieldMetadataType.RawJson,
                  "name": "steps",
                  "label": "Version steps",
                  "description": "Json object to provide steps",
                  "icon": "IconSettingsAutomation",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "2b8f293d-d90c-4796-8324-8a6fef5334fb",
                  "type": FieldMetadataType.Relation,
                  "name": "workflow",
                  "label": "Workflow",
                  "description": "WorkflowVersion workflow",
                  "icon": "IconSettingsAutomation",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "6425441d-49f2-4cb5-a9e2-f4acce604da4",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "fad28eb7-a085-4917-93b3-579afd54f373",
                      "nameSingular": "workflowVersion",
                      "namePlural": "workflowVersions"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "2b8f293d-d90c-4796-8324-8a6fef5334fb",
                      "name": "workflow"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "8ee31473-4b30-4870-bcaa-92d77ad56bb6",
                      "nameSingular": "workflow",
                      "namePlural": "workflows"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "01508898-496f-4256-bc88-a907faedc424",
                      "name": "versions"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "ce353034-a10e-4ead-8ae9-acffcc5f4bd9",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "10880377-0ba7-4e4b-8e9b-2970d457791c",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "uuid",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "81760bd0-5d19-42bc-a68a-c9771f3c1d94",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_a362c5eff4a28fcdffdd3bdff16",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "dce1e1f3-c31e-4c99-a19e-83541aa38767",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "0acb3058-0980-4c66-a04a-84b0992ddc9e"
                        }
                      }
                    ]
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
          "id": "f46b3fd8-c78d-4203-acf3-dec44e6a0330",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "a6d801ab-86c2-4927-9514-15941ceb3f01",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "9609d742-854b-48cd-86cc-582ac1b83ded",
                  "type": FieldMetadataType.Boolean,
                  "name": "isVisible",
                  "label": "Visible",
                  "description": "View Group visibility",
                  "icon": "IconEye",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "70bbfd52-de22-4616-9b15-95934fc9750f",
                  "type": FieldMetadataType.Number,
                  "name": "position",
                  "label": "Position",
                  "description": "View Field position",
                  "icon": "IconList",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "de0b33e4-7e73-4f4e-b010-6f8343b0e510",
                  "type": FieldMetadataType.Text,
                  "name": "fieldValue",
                  "label": "Field Value",
                  "description": "Group by this field value",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "0fabe03d-9be8-49ac-aa59-03e36c836790",
                  "type": FieldMetadataType.Uuid,
                  "name": "fieldMetadataId",
                  "label": "Field Metadata Id",
                  "description": "View Group target field",
                  "icon": "IconTag",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "46e04019-dc99-4cbd-a313-0b8603230692",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "3db34f42-2dde-4a5f-9607-60b319aad24d",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "66a8054a-4d36-49af-bd29-c48c63383c95",
                  "type": FieldMetadataType.Relation,
                  "name": "view",
                  "label": "View",
                  "description": "View Group related view",
                  "icon": "IconLayoutCollage",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "af260d5e-13f4-4e6a-bf9f-9790d4335ea4",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "f46b3fd8-c78d-4203-acf3-dec44e6a0330",
                      "nameSingular": "viewGroup",
                      "namePlural": "viewGroups"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "66a8054a-4d36-49af-bd29-c48c63383c95",
                      "name": "view"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "88520ce4-938b-4d9f-a5ea-61e5e89f767e",
                      "nameSingular": "view",
                      "namePlural": "views"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "1c0d42dd-1339-4228-9e7c-1fd00d6913f4",
                      "name": "viewGroups"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "432000f7-c86f-4e85-8ba0-67d2c6b24735",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "a6d801ab-86c2-4927-9514-15941ceb3f01",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "35e01744-4117-4f1f-91b5-6e91a014cff9",
                  "type": FieldMetadataType.Uuid,
                  "name": "viewId",
                  "label": "View id (foreign key)",
                  "description": "View Group related view id foreign key",
                  "icon": "IconLayoutCollage",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "9a2af221-ff70-462a-9a0d-273294f76b11",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_3819ec73f42c743a0d3700ae8e4",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "227f458e-c34d-4edc-a0cd-724b8d8198fb",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "35e01744-4117-4f1f-91b5-6e91a014cff9"
                        }
                      }
                    ]
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
          "id": "e9677a5e-ce9b-44e2-840c-c73fc9c64f1e",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "56c8c695-a08b-406f-8a9a-5c3b7682a355",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "ac8bb4f0-4fb9-4d98-8649-fd32dae2ec7e",
                  "type": FieldMetadataType.Relation,
                  "name": "calendarEvent",
                  "label": "Event ID",
                  "description": "Event ID",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "8a9dd19e-e31a-4743-adbc-5570bdde4748",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "e9677a5e-ce9b-44e2-840c-c73fc9c64f1e",
                      "nameSingular": "calendarChannelEventAssociation",
                      "namePlural": "calendarChannelEventAssociations"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "ac8bb4f0-4fb9-4d98-8649-fd32dae2ec7e",
                      "name": "calendarEvent"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "e7a5e974-affc-40d5-be9f-2ba2783c21be",
                      "nameSingular": "calendarEvent",
                      "namePlural": "calendarEvents"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "67a1dc04-5e3a-4dda-8c21-4d1d74605b54",
                      "name": "calendarChannelEventAssociations"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "c90cfcf9-28a5-42ce-81c6-33ee9c106b73",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "24cf2a29-ee54-4fab-987f-7dc1e030828c",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "0080b3c4-4976-4354-b46a-fa2e827be3e1",
                  "type": FieldMetadataType.Text,
                  "name": "recurringEventExternalId",
                  "label": "Recurring Event ID",
                  "description": "Recurring Event ID",
                  "icon": "IconHistory",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "56c8c695-a08b-406f-8a9a-5c3b7682a355",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "48184b1a-843b-4dc5-a3a9-d266b359301f",
                  "type": FieldMetadataType.Uuid,
                  "name": "calendarEventId",
                  "label": "Event ID id (foreign key)",
                  "description": "Event ID id foreign key",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "d2ccfbf0-0c9b-446e-a147-73b79fa32a62",
                  "type": FieldMetadataType.Text,
                  "name": "eventExternalId",
                  "label": "Event external ID",
                  "description": "Event external ID",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "37cc04ac-ae53-40c5-8a66-bd2e84244f05",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "4d0f0c12-fca8-4111-ab73-95ba8bc4c404",
                  "type": FieldMetadataType.Relation,
                  "name": "calendarChannel",
                  "label": "Channel ID",
                  "description": "Channel ID",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "9285dd0e-c431-421e-993f-17ddda252c29",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "e9677a5e-ce9b-44e2-840c-c73fc9c64f1e",
                      "nameSingular": "calendarChannelEventAssociation",
                      "namePlural": "calendarChannelEventAssociations"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "4d0f0c12-fca8-4111-ab73-95ba8bc4c404",
                      "name": "calendarChannel"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "024357b0-9d5b-4e68-b8e2-70acf57a9aba",
                      "nameSingular": "calendarChannel",
                      "namePlural": "calendarChannels"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "9f58df6d-c341-42ff-a4d3-1278b617f3c1",
                      "name": "calendarChannelEventAssociations"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "06d38735-2073-4a3d-9a67-45c7bd00df60",
                  "type": FieldMetadataType.Uuid,
                  "name": "calendarChannelId",
                  "label": "Channel ID id (foreign key)",
                  "description": "Channel ID id foreign key",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "3b18525d-7b87-4fa4-91b5-46cd6cfdf501",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_92a888b681107c4f78926820db7",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "dfa07df1-a071-4b7a-b574-32419d37b5f5",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "c90cfcf9-28a5-42ce-81c6-33ee9c106b73"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "da9fc6ec-8b75-4a24-8693-4923900fb409",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "48184b1a-843b-4dc5-a3a9-d266b359301f"
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
                  "id": "63019d1e-d986-47d9-bf6e-200cea4422aa",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_a88c3ab301c25202d4b52fb4b1b",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "4e831c1f-8089-4c72-ab06-0a3f07247563",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "c90cfcf9-28a5-42ce-81c6-33ee9c106b73"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "3ce50d65-524e-4dea-8938-1802339bcf9f",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "06d38735-2073-4a3d-9a67-45c7bd00df60"
                        }
                      }
                    ]
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
          "id": "e85877ca-dc73-4b9e-b9b7-139dc06ca7b7",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "75b1154a-d3db-4492-b9c7-ebbc046b0da6",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": "O",
          "isLabelSyncedWithName": false,
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
                  "id": "a532ecf7-6e9c-4980-8f2c-9b8b37f4f1ce",
                  "type": FieldMetadataType.Relation,
                  "name": "timelineActivities",
                  "label": "Timeline Activities",
                  "description": "Timeline Activities linked to the opportunity.",
                  "icon": "IconTimelineEvent",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "1f45c275-bc77-4469-b180-2be3916b6f08",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "e85877ca-dc73-4b9e-b9b7-139dc06ca7b7",
                      "nameSingular": "opportunity",
                      "namePlural": "opportunities"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "a532ecf7-6e9c-4980-8f2c-9b8b37f4f1ce",
                      "name": "timelineActivities"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "082301c2-cd4d-4cdf-ab5a-98a71d493036",
                      "nameSingular": "timelineActivity",
                      "namePlural": "timelineActivities"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "5607d2b7-1027-42d2-9362-4b51d473758a",
                      "name": "opportunity"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "1f28c888-a54d-427c-ac2b-b240a417c2a3",
                  "type": FieldMetadataType.Uuid,
                  "name": "companyId",
                  "label": "Company id (foreign key)",
                  "description": "Opportunity company id foreign key",
                  "icon": "IconBuildingSkyscraper",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "13c8798a-234a-42ab-8051-c3a8a2478811",
                  "type": FieldMetadataType.Relation,
                  "name": "attachments",
                  "label": "Attachments",
                  "description": "Attachments linked to the opportunity",
                  "icon": "IconFileImport",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "d6f4bd6d-7d93-4111-b885-61c7f63a1edc",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "e85877ca-dc73-4b9e-b9b7-139dc06ca7b7",
                      "nameSingular": "opportunity",
                      "namePlural": "opportunities"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "13c8798a-234a-42ab-8051-c3a8a2478811",
                      "name": "attachments"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "ba95cbd9-694f-4ae5-906d-1f7cd213c9fe",
                      "nameSingular": "attachment",
                      "namePlural": "attachments"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "98c67807-d6b1-4d77-8788-88e09e4495f1",
                      "name": "opportunity"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "57b74932-1aa3-4372-9962-138ff1493eeb",
                  "type": FieldMetadataType.Relation,
                  "name": "favorites",
                  "label": "Favorites",
                  "description": "Favorites linked to the opportunity",
                  "icon": "IconHeart",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "0cc12e6a-f7f5-40e5-a686-0eba9c8ed934",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "e85877ca-dc73-4b9e-b9b7-139dc06ca7b7",
                      "nameSingular": "opportunity",
                      "namePlural": "opportunities"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "57b74932-1aa3-4372-9962-138ff1493eeb",
                      "name": "favorites"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "6d72fd09-755d-409b-8455-f74da70fa9c1",
                      "nameSingular": "favorite",
                      "namePlural": "favorites"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "e1c22c51-fdf3-4c9f-bcce-e4e4c0ebc915",
                      "name": "opportunity"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "77cf5639-c273-4495-897c-87b559433b79",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "306eda7f-5483-49a6-89ac-3b5290f54040",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "8ed10688-93f8-4d1e-8051-47c784244be1",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "13cc2ff2-c423-4502-8ea3-d7679b86bcd0",
                  "type": FieldMetadataType.Relation,
                  "name": "noteTargets",
                  "label": "Notes",
                  "description": "Notes tied to the opportunity",
                  "icon": "IconNotes",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "a1922bea-dc39-46ce-9237-3d969a82897e",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "e85877ca-dc73-4b9e-b9b7-139dc06ca7b7",
                      "nameSingular": "opportunity",
                      "namePlural": "opportunities"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "13cc2ff2-c423-4502-8ea3-d7679b86bcd0",
                      "name": "noteTargets"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "01d676a5-d7e9-4d21-98a4-fbaccfa7ffdf",
                      "nameSingular": "noteTarget",
                      "namePlural": "noteTargets"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "6a1cb524-661c-4a0a-8552-edd5ee8c3070",
                      "name": "opportunity"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "fb964332-c2a5-43d0-8da1-ff7127fa0a42",
                  "type": FieldMetadataType.Relation,
                  "name": "pointOfContact",
                  "label": "Point of Contact",
                  "description": "Opportunity point of contact",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "6aa55cb7-0038-495b-97f2-c80a48c5819a",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "e85877ca-dc73-4b9e-b9b7-139dc06ca7b7",
                      "nameSingular": "opportunity",
                      "namePlural": "opportunities"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "fb964332-c2a5-43d0-8da1-ff7127fa0a42",
                      "name": "pointOfContact"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "1c05dac8-29f7-4f1e-9f61-579ad0eb647d",
                      "nameSingular": "person",
                      "namePlural": "people"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "dbec4d0c-a037-42d9-8e49-b945f65eec23",
                      "name": "pointOfContactForOpportunities"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "69eeb44c-8fa2-4b89-9a12-cc4668c4334d",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "c9b17c6b-286e-4ee9-af2c-01fca39e46c9",
                  "type": FieldMetadataType.TsVector,
                  "name": "searchVector",
                  "label": "Search vector",
                  "description": "Field used for full-text search",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "98bc2348-f202-4525-82cf-ce4f992e58fc",
                  "type": FieldMetadataType.Select,
                  "name": "stage",
                  "label": "Stage",
                  "description": "Opportunity stage",
                  "icon": "IconProgressCheck",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "'NEW'",
                  "options": [
                    {
                      "id": "0db17ea8-55e2-4095-83c7-52a3d7846e68",
                      "color": "red",
                      "label": "New",
                      "value": "NEW",
                      "position": 0
                    },
                    {
                      "id": "7907806c-0fb9-4619-8014-07cf753c9608",
                      "color": "purple",
                      "label": "Screening",
                      "value": "SCREENING",
                      "position": 1
                    },
                    {
                      "id": "2084e0b5-bf8d-4a19-8c76-c7fcaa6eb5a7",
                      "color": "sky",
                      "label": "Meeting",
                      "value": "MEETING",
                      "position": 2
                    },
                    {
                      "id": "9f2a2b87-7393-46ca-ba5a-5483ec9995fc",
                      "color": "turquoise",
                      "label": "Proposal",
                      "value": "PROPOSAL",
                      "position": 3
                    },
                    {
                      "id": "29b9cf49-ff05-40cc-baf0-cdb2f8a1e5bf",
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
                  "id": "a5666ad4-ad67-4b27-b9a6-6dd3d1b59d97",
                  "type": FieldMetadataType.Currency,
                  "name": "amount",
                  "label": "Amount",
                  "description": "Opportunity amount",
                  "icon": "IconCurrencyDollar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "e24d5ae6-6675-4b3e-a52f-5c21df92fb7c",
                  "type": FieldMetadataType.DateTime,
                  "name": "closeDate",
                  "label": "Close date",
                  "description": "Opportunity close date",
                  "icon": "IconCalendarEvent",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "0a687cbd-7462-41ec-a23b-d6430de48cf0",
                  "type": FieldMetadataType.Relation,
                  "name": "taskTargets",
                  "label": "Tasks",
                  "description": "Tasks tied to the opportunity",
                  "icon": "IconCheckbox",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "e1ee47a2-c138-4d9d-95da-46e3c7ee0816",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "e85877ca-dc73-4b9e-b9b7-139dc06ca7b7",
                      "nameSingular": "opportunity",
                      "namePlural": "opportunities"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "0a687cbd-7462-41ec-a23b-d6430de48cf0",
                      "name": "taskTargets"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "84c4f534-4798-47ab-b725-a122e966ae9e",
                      "nameSingular": "taskTarget",
                      "namePlural": "taskTargets"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "62113668-83c0-4b0d-93de-b3380a4378c0",
                      "name": "opportunity"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "75b1154a-d3db-4492-b9c7-ebbc046b0da6",
                  "type": FieldMetadataType.Text,
                  "name": "name",
                  "label": "Name",
                  "description": "The opportunity name",
                  "icon": "IconTargetArrow",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "65c671ad-fca9-473f-b76a-74c02922cd62",
                  "type": FieldMetadataType.Uuid,
                  "name": "pointOfContactId",
                  "label": "Point of Contact id (foreign key)",
                  "description": "Opportunity point of contact id foreign key",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "eb803915-2b19-44ff-86dd-3de5753f8ee2",
                  "type": FieldMetadataType.Position,
                  "name": "position",
                  "label": "Position",
                  "description": "Opportunity record position",
                  "icon": "IconHierarchy2",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "92d11fd5-ea02-4d32-a737-411fac9fd8b5",
                  "type": FieldMetadataType.Relation,
                  "name": "company",
                  "label": "Company",
                  "description": "Opportunity company",
                  "icon": "IconBuildingSkyscraper",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "ca9f7a40-30f1-4f83-a8cc-6bdd30ad8056",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "e85877ca-dc73-4b9e-b9b7-139dc06ca7b7",
                      "nameSingular": "opportunity",
                      "namePlural": "opportunities"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "92d11fd5-ea02-4d32-a737-411fac9fd8b5",
                      "name": "company"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "af4e5bad-fa25-46ab-b32e-1147b5210107",
                      "nameSingular": "company",
                      "namePlural": "companies"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "029aa48f-d842-4120-9ad1-ded40547ac61",
                      "name": "opportunities"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "55864fe7-c125-407d-b1eb-f9e51f8d6f4b",
                  "type": FieldMetadataType.Actor,
                  "name": "createdBy",
                  "label": "Created by",
                  "description": "The creator of the record",
                  "icon": "IconCreativeCommonsSa",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "9311b7fd-4808-4679-b100-54cbf379d77a",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_9f96d65260c4676faac27cb6bf3",
                  "indexWhereClause": null,
                  "indexType": IndexType.Gin,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "aa5a7130-8266-423c-a7c1-7a6f57cde89f",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "c9b17c6b-286e-4ee9-af2c-01fca39e46c9"
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
                  "id": "25a06cab-a0b3-4702-a46e-506c26576d66",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_4f469d3a7ee08aefdc099836364",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "be0953ba-0547-41b3-acdf-6c9290f27ffc",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "77cf5639-c273-4495-897c-87b559433b79"
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
                  "id": "d0af7130-631c-4980-86cc-59719b7bd37f",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_82cdf247553f960093baa7c6635",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "c4a04777-572a-407a-9883-43cc9e89907a",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "77cf5639-c273-4495-897c-87b559433b79"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "f67113c7-e2e1-436b-9e49-3d50b7c1b3d6",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "65c671ad-fca9-473f-b76a-74c02922cd62"
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
                  "id": "105b3d42-6ec9-443a-a1d8-8c394961be05",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_425ac6c73ecb993cf9cbc2c2b00",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "d0812a0f-553a-45c6-9844-50692a593fdb",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "1f28c888-a54d-427c-ac2b-b240a417c2a3"
                        }
                      }
                    ]
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
          "id": "e7a5e974-affc-40d5-be9f-2ba2783c21be",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "54286517-a277-407e-b90d-d52bfdcc8413",
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
                  "id": "ba15e75b-b2ff-46ed-a51c-e1c78f30e7ab",
                  "type": FieldMetadataType.Text,
                  "name": "conferenceSolution",
                  "label": "Conference Solution",
                  "description": "Conference Solution",
                  "icon": "IconScreenShare",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "8c4e0319-cbae-4b47-b7e3-04dcabed5de7",
                  "type": FieldMetadataType.DateTime,
                  "name": "externalCreatedAt",
                  "label": "Creation DateTime",
                  "description": "Creation DateTime",
                  "icon": "IconCalendarPlus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "dd586184-7c2d-4cd0-9acf-66eb5b35e748",
                  "type": FieldMetadataType.DateTime,
                  "name": "endsAt",
                  "label": "End Date",
                  "description": "End Date",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "35a7c874-d55b-47b5-8e6f-7c3cad1a814a",
                  "type": FieldMetadataType.DateTime,
                  "name": "externalUpdatedAt",
                  "label": "Update DateTime",
                  "description": "Update DateTime",
                  "icon": "IconCalendarCog",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "be9c35ab-b3eb-4053-971a-88f7ad3b5636",
                  "type": FieldMetadataType.Boolean,
                  "name": "isCanceled",
                  "label": "Is canceled",
                  "description": "Is canceled",
                  "icon": "IconCalendarCancel",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "543d7dba-1469-4733-af82-daea7a226944",
                  "type": FieldMetadataType.Links,
                  "name": "conferenceLink",
                  "label": "Meet Link",
                  "description": "Meet Link",
                  "icon": "IconLink",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "73dcdf65-ba3f-4a1f-984b-b1364e111151",
                  "type": FieldMetadataType.DateTime,
                  "name": "startsAt",
                  "label": "Start Date",
                  "description": "Start Date",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "50ba6c47-1d45-48e2-b3f0-71b82e7f2b91",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "d1ac1b77-5a11-445b-8900-740ecd0466e1",
                  "type": FieldMetadataType.Boolean,
                  "name": "isFullDay",
                  "label": "Is Full Day",
                  "description": "Is Full Day",
                  "icon": "Icon24Hours",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "b2be2ff3-4d92-4326-a18a-2fbca11bb0f6",
                  "type": FieldMetadataType.Text,
                  "name": "iCalUID",
                  "label": "iCal UID",
                  "description": "iCal UID",
                  "icon": "IconKey",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "54286517-a277-407e-b90d-d52bfdcc8413",
                  "type": FieldMetadataType.Text,
                  "name": "title",
                  "label": "Title",
                  "description": "Title",
                  "icon": "IconH1",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "a24a0b33-866c-4e8c-beb8-59ff70e2b567",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "09edc594-fdc7-44a4-8079-9560c804e85b",
                  "type": FieldMetadataType.Relation,
                  "name": "calendarEventParticipants",
                  "label": "Event Participants",
                  "description": "Event Participants",
                  "icon": "IconUserCircle",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "3d04a82d-f4eb-4c8d-b09f-e86409e0883b",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "e7a5e974-affc-40d5-be9f-2ba2783c21be",
                      "nameSingular": "calendarEvent",
                      "namePlural": "calendarEvents"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "09edc594-fdc7-44a4-8079-9560c804e85b",
                      "name": "calendarEventParticipants"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "5706c0cc-9d33-4bb8-8b6d-db74b8d882c8",
                      "nameSingular": "calendarEventParticipant",
                      "namePlural": "calendarEventParticipants"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "1cb56c41-518b-4c17-a171-03c078c5da81",
                      "name": "calendarEvent"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "67a1dc04-5e3a-4dda-8c21-4d1d74605b54",
                  "type": FieldMetadataType.Relation,
                  "name": "calendarChannelEventAssociations",
                  "label": "Calendar Channel Event Associations",
                  "description": "Calendar Channel Event Associations",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "8a9dd19e-e31a-4743-adbc-5570bdde4748",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "e7a5e974-affc-40d5-be9f-2ba2783c21be",
                      "nameSingular": "calendarEvent",
                      "namePlural": "calendarEvents"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "67a1dc04-5e3a-4dda-8c21-4d1d74605b54",
                      "name": "calendarChannelEventAssociations"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "e9677a5e-ce9b-44e2-840c-c73fc9c64f1e",
                      "nameSingular": "calendarChannelEventAssociation",
                      "namePlural": "calendarChannelEventAssociations"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "ac8bb4f0-4fb9-4d98-8649-fd32dae2ec7e",
                      "name": "calendarEvent"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "606a1a41-3b40-4eab-8c99-8cae5bfda4e0",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "e8557e5a-6d22-455a-b5f5-25df58845478",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "95223c7e-dfe9-4c8c-a278-04b7b385d81f",
                  "type": FieldMetadataType.Text,
                  "name": "description",
                  "label": "Description",
                  "description": "Description",
                  "icon": "IconFileDescription",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "433292a4-cdae-4752-a291-c32b2db8ff85",
                  "type": FieldMetadataType.Text,
                  "name": "location",
                  "label": "Location",
                  "description": "Location",
                  "icon": "IconMapPin",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
          "id": "c0242465-7a74-439d-9b8c-60737c781e3f",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "ce16d1b1-d034-463d-802a-9bdf85621e96",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "e79e466c-e7fa-460d-be8b-be17973e9f4e",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "ce16d1b1-d034-463d-802a-9bdf85621e96",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "a6575e42-bc36-4bfd-bcdf-9b5236cc798f",
                  "type": FieldMetadataType.Text,
                  "name": "direction",
                  "label": "Direction",
                  "description": "View Sort direction",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "8a7b8246-7699-4a1e-a946-6378ad2a904f",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "27d1a7d0-e4f1-4e88-9460-004838fb9075",
                  "type": FieldMetadataType.Uuid,
                  "name": "viewId",
                  "label": "View id (foreign key)",
                  "description": "View Sort related view id foreign key",
                  "icon": "IconLayoutCollage",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "dca82c7e-aff3-4a8e-94ce-6174c6dfd950",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "eb4e0589-4d58-4ded-9261-7f91c75b4ef5",
                  "type": FieldMetadataType.Relation,
                  "name": "view",
                  "label": "View",
                  "description": "View Sort related view",
                  "icon": "IconLayoutCollage",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "a76af472-0c5f-420c-8f7a-96827675d084",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "c0242465-7a74-439d-9b8c-60737c781e3f",
                      "nameSingular": "viewSort",
                      "namePlural": "viewSorts"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "eb4e0589-4d58-4ded-9261-7f91c75b4ef5",
                      "name": "view"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "88520ce4-938b-4d9f-a5ea-61e5e89f767e",
                      "nameSingular": "view",
                      "namePlural": "views"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "8ea5df10-7aaf-417f-b131-e18c902b7330",
                      "name": "viewSorts"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "860225c1-357f-46d1-8d5d-6334da2213cc",
                  "type": FieldMetadataType.Uuid,
                  "name": "fieldMetadataId",
                  "label": "Field Metadata Id",
                  "description": "View Sort target field",
                  "icon": "IconTag",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "d41392b8-2a59-4a14-91ff-b6e6e87863dc",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_a01889a3e5b30d56447736329aa",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "c1029dbb-65f6-4281-b4fe-55c13ff2fb2b",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "27d1a7d0-e4f1-4e88-9460-004838fb9075"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "53bdad93-480a-45ab-a18f-3e9aa6d9df68",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "e79e466c-e7fa-460d-be8b-be17973e9f4e"
                        }
                      }
                    ]
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
          "id": "ba95cbd9-694f-4ae5-906d-1f7cd213c9fe",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "3c643758-d1b8-4605-b544-469f9a7aca35",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "b0c5d631-1242-4fbc-9570-501a17a65338",
                  "type": FieldMetadataType.Relation,
                  "name": "rocket",
                  "label": "Rocket",
                  "description": "Attachment Rocket",
                  "icon": "IconBuildingSkyscraper",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:30.780Z",
                  "updatedAt": "2024-10-30T13:39:30.780Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "bf3ebee1-7f7c-4f0a-923b-278b055708d9",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "ba95cbd9-694f-4ae5-906d-1f7cd213c9fe",
                      "nameSingular": "attachment",
                      "namePlural": "attachments"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "b0c5d631-1242-4fbc-9570-501a17a65338",
                      "name": "rocket"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "413848a7-bd94-4c24-aadc-0a5afe7a781f",
                      "nameSingular": "rocket",
                      "namePlural": "rockets"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "6e47f007-07b7-4158-8c17-412fb3685545",
                      "name": "attachments"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "b603e4f0-a364-47e2-93a2-794d67f26d48",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "31a56b77-b8ba-416d-bf48-b43d08dfdf5d",
                  "type": FieldMetadataType.Uuid,
                  "name": "companyId",
                  "label": "Company id (foreign key)",
                  "description": "Attachment company id foreign key",
                  "icon": "IconBuildingSkyscraper",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "62d99c85-a1ca-44d1-ab8c-b8c34c5860a2",
                  "type": FieldMetadataType.Uuid,
                  "name": "authorId",
                  "label": "Author id (foreign key)",
                  "description": "Attachment author id foreign key",
                  "icon": "IconCircleUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "c72fe729-e505-449c-b3a9-1987ba4d70e0",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "0498c627-ac84-46e1-b7dc-fe6f2e3f204f",
                  "type": FieldMetadataType.Text,
                  "name": "fullPath",
                  "label": "Full path",
                  "description": "Attachment full path",
                  "icon": "IconLink",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "10c6236c-2bb6-4a11-ad24-3e8695c24616",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "98c67807-d6b1-4d77-8788-88e09e4495f1",
                  "type": FieldMetadataType.Relation,
                  "name": "opportunity",
                  "label": "Opportunity",
                  "description": "Attachment opportunity",
                  "icon": "IconBuildingSkyscraper",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "d6f4bd6d-7d93-4111-b885-61c7f63a1edc",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "ba95cbd9-694f-4ae5-906d-1f7cd213c9fe",
                      "nameSingular": "attachment",
                      "namePlural": "attachments"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "98c67807-d6b1-4d77-8788-88e09e4495f1",
                      "name": "opportunity"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "e85877ca-dc73-4b9e-b9b7-139dc06ca7b7",
                      "nameSingular": "opportunity",
                      "namePlural": "opportunities"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "13c8798a-234a-42ab-8051-c3a8a2478811",
                      "name": "attachments"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "ee3e26b4-e615-4cf5-82bd-32abd4c65683",
                  "type": FieldMetadataType.Uuid,
                  "name": "opportunityId",
                  "label": "Opportunity id (foreign key)",
                  "description": "Attachment opportunity id foreign key",
                  "icon": "IconBuildingSkyscraper",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "9033f278-7b1d-4a7e-9989-c3d3b6fd750b",
                  "type": FieldMetadataType.Uuid,
                  "name": "personId",
                  "label": "Person id (foreign key)",
                  "description": "Attachment person id foreign key",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "4ccca276-e876-4a1d-b64b-12ab3242b605",
                  "type": FieldMetadataType.Relation,
                  "name": "person",
                  "label": "Person",
                  "description": "Attachment person",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "13103358-7184-4a0c-87e7-1f622480cb36",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "ba95cbd9-694f-4ae5-906d-1f7cd213c9fe",
                      "nameSingular": "attachment",
                      "namePlural": "attachments"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "4ccca276-e876-4a1d-b64b-12ab3242b605",
                      "name": "person"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "1c05dac8-29f7-4f1e-9f61-579ad0eb647d",
                      "nameSingular": "person",
                      "namePlural": "people"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "bc5fe4dd-e737-4596-bbb2-50660f43b920",
                      "name": "attachments"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "3ca64b7f-1365-4d71-add0-c5439be2b4a3",
                  "type": FieldMetadataType.Uuid,
                  "name": "noteId",
                  "label": "Note id (foreign key)",
                  "description": "Attachment note id foreign key",
                  "icon": "IconNotes",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "12eb10d6-2890-4c94-a278-5e94f9dd3d3e",
                  "type": FieldMetadataType.Relation,
                  "name": "company",
                  "label": "Company",
                  "description": "Attachment company",
                  "icon": "IconBuildingSkyscraper",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "06685252-e45f-4be7-b26c-4cef8f9f1bf6",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "ba95cbd9-694f-4ae5-906d-1f7cd213c9fe",
                      "nameSingular": "attachment",
                      "namePlural": "attachments"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "12eb10d6-2890-4c94-a278-5e94f9dd3d3e",
                      "name": "company"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "af4e5bad-fa25-46ab-b32e-1147b5210107",
                      "nameSingular": "company",
                      "namePlural": "companies"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "53fc0161-cf55-4c8e-bf86-64197868a89a",
                      "name": "attachments"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "cdf24ecd-536b-430c-a5d5-01d875f6d72d",
                  "type": FieldMetadataType.Relation,
                  "name": "author",
                  "label": "Author",
                  "description": "Attachment author",
                  "icon": "IconCircleUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "032b61bb-ee5d-4996-8988-644cd785f0d5",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "ba95cbd9-694f-4ae5-906d-1f7cd213c9fe",
                      "nameSingular": "attachment",
                      "namePlural": "attachments"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "cdf24ecd-536b-430c-a5d5-01d875f6d72d",
                      "name": "author"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "a6ae81d6-b50b-4183-a2bb-ebcc0428dd53",
                      "nameSingular": "workspaceMember",
                      "namePlural": "workspaceMembers"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "612338fe-45ea-444b-845e-a2d049b86f80",
                      "name": "authoredAttachments"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "42e91677-2ca8-47ca-bce9-0f89369fe20e",
                  "type": FieldMetadataType.Relation,
                  "name": "note",
                  "label": "Note",
                  "description": "Attachment note",
                  "icon": "IconNotes",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "54b587f6-d064-4d26-ad76-bb25c02467ba",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "ba95cbd9-694f-4ae5-906d-1f7cd213c9fe",
                      "nameSingular": "attachment",
                      "namePlural": "attachments"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "42e91677-2ca8-47ca-bce9-0f89369fe20e",
                      "name": "note"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "7adf354a-c57f-4c76-8079-259f237dc5da",
                      "nameSingular": "note",
                      "namePlural": "notes"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "2e691afe-cf6b-4d3a-9197-fd524c26eed7",
                      "name": "attachments"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "7dc36395-4c42-42cf-be4e-ce5c2a37f52e",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "1b79ba2b-e179-4d58-b864-aeed0b2b8647",
                  "type": FieldMetadataType.Uuid,
                  "name": "taskId",
                  "label": "Task id (foreign key)",
                  "description": "Attachment task id foreign key",
                  "icon": "IconNotes",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "3c643758-d1b8-4605-b544-469f9a7aca35",
                  "type": FieldMetadataType.Text,
                  "name": "name",
                  "label": "Name",
                  "description": "Attachment name",
                  "icon": "IconFileUpload",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "e1186bb6-6864-4a5e-99bb-c77c2a3fd747",
                  "type": FieldMetadataType.Relation,
                  "name": "task",
                  "label": "Task",
                  "description": "Attachment task",
                  "icon": "IconNotes",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "10a59354-1c7c-4f9d-8ef4-5834319fbed0",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "ba95cbd9-694f-4ae5-906d-1f7cd213c9fe",
                      "nameSingular": "attachment",
                      "namePlural": "attachments"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "e1186bb6-6864-4a5e-99bb-c77c2a3fd747",
                      "name": "task"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "25e10253-f0e1-4a6d-90e3-ad62a4b20292",
                      "nameSingular": "task",
                      "namePlural": "tasks"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "0426d319-3928-4dfc-93ce-d4cc6172b30d",
                      "name": "attachments"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "e4b8efea-e530-4d71-93d0-1bab8b7de560",
                  "type": FieldMetadataType.Text,
                  "name": "type",
                  "label": "Type",
                  "description": "Attachment type",
                  "icon": "IconList",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "26b6ac5f-e7bc-4107-82cd-4deb51c62966",
                  "type": FieldMetadataType.Uuid,
                  "name": "rocketId",
                  "label": "Rocket ID (foreign key)",
                  "description": "Attachment Rocket id foreign key",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:30.637Z",
                  "updatedAt": "2024-10-30T13:39:30.637Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": {
                    "isForeignKey": true
                  },
                  "relationDefinition": null
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "4c5b5ca6-80bf-4d0d-a0cb-247d2fc59675",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_2055e4e583e9a2e5b4c239fd992",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "742622b9-53cc-4638-9695-f09f2de6f27b",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "1b79ba2b-e179-4d58-b864-aeed0b2b8647"
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
                  "id": "ce735c2d-1818-456a-a3b5-f06e784186e0",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_91e687ea21123af4e02c9a07a43",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
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
                  "id": "e5d0c4ed-3a43-407d-808a-73493c28d7fb",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_3ca1d5243ff67f58c7c65c9a8a2",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "2a221b25-860b-43ca-a881-651b48d1b013",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "9033f278-7b1d-4a7e-9989-c3d3b6fd750b"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "e313c85c-90d7-4d26-801d-24f79a118f42",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "c72fe729-e505-449c-b3a9-1987ba4d70e0"
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
                  "id": "f80ceedc-e94d-4303-9f31-993097c7ad38",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_0698fed0e67005b7051b5d353b6",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "dae922ce-13c9-49ee-97aa-67b452b1a919",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "3ca64b7f-1365-4d71-add0-c5439be2b4a3"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "657ab772-28a5-4d8f-a48d-c0f704ae4960",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "c72fe729-e505-449c-b3a9-1987ba4d70e0"
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
                  "id": "4435a337-4bb0-4191-a489-dc02a3bec5cd",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_73615a6bdc972b013956b19c59e",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "432ca636-9856-429f-a5e9-a0e540d84bb5",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "ee3e26b4-e615-4cf5-82bd-32abd4c65683"
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
                  "id": "b8779f2a-0e28-4a21-afa2-b6efc0e4a5e9",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_30f969e0ec549acca94396d3efe",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "5331f45b-7bb4-46e0-b600-e125632c6fcf",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "c72fe729-e505-449c-b3a9-1987ba4d70e0"
                        }
                      }
                    ]
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
          "id": "b6ebd1d3-81ea-432d-9e43-87d92c76aaca",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "4724a667-cc81-4ab8-b539-7cfb600d64fd",
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
                  "id": "a0afb833-f69f-412b-a7ba-26943ed3fb56",
                  "type": FieldMetadataType.Text,
                  "name": "description",
                  "label": "Description",
                  "description": null,
                  "icon": "IconInfo",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "0e1b5461-98df-41d1-a33b-fec6bf065b19",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "153053af-3c65-419e-a4b0-126f53b55304",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "4724a667-cc81-4ab8-b539-7cfb600d64fd",
                  "type": FieldMetadataType.Text,
                  "name": "targetUrl",
                  "label": "Target Url",
                  "description": "Webhook target url",
                  "icon": "IconLink",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "3342fee9-486b-4e00-9277-77fe81cc330d",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "06b7e134-e473-4ba5-a581-af7e3c4556ae",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "5287c4e3-8766-413b-b461-dd1f0da42f0f",
                  "type": FieldMetadataType.Array,
                  "name": "operations",
                  "label": "Operations",
                  "description": "Webhook operations",
                  "icon": "IconCheckbox",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": [
                    "*.*"
                  ],
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
          "id": "b62c1e5e-cb2c-4f66-bd0a-777ea6198ca8",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
          "nameSingular": "workflowEventListener",
          "namePlural": "workflowEventListeners",
          "labelSingular": "WorkflowEventListener",
          "labelPlural": "WorkflowEventListeners",
          "description": "A workflow event listener",
          "icon": "IconSettingsAutomation",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "a6855cee-12e8-49a4-ad6d-2b35a49b1f5a",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "a6855cee-12e8-49a4-ad6d-2b35a49b1f5a",
                  "type": FieldMetadataType.Text,
                  "name": "eventName",
                  "label": "Name",
                  "description": "The workflow event listener name",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "7e8b73cc-be95-44f2-900e-48c2adf2c599",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "aef588f4-f4e9-482c-aa4e-611f09066758",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "743d0810-9a03-4481-8397-716c3c7fe3b9",
                  "type": FieldMetadataType.Relation,
                  "name": "workflow",
                  "label": "Workflow",
                  "description": "WorkflowEventListener workflow",
                  "icon": "IconSettingsAutomation",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "6208cf61-25fa-4660-9b39-ea1e52aa23c8",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "b62c1e5e-cb2c-4f66-bd0a-777ea6198ca8",
                      "nameSingular": "workflowEventListener",
                      "namePlural": "workflowEventListeners"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "743d0810-9a03-4481-8397-716c3c7fe3b9",
                      "name": "workflow"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "8ee31473-4b30-4870-bcaa-92d77ad56bb6",
                      "nameSingular": "workflow",
                      "namePlural": "workflows"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "27b31a92-d137-48e0-8abe-a979a92bd486",
                      "name": "eventListeners"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "c22fa0ef-9ccd-4619-af0e-0d7237830446",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "eeb228e9-5550-497d-961a-ee96983d6c9d",
                  "type": FieldMetadataType.Uuid,
                  "name": "workflowId",
                  "label": "Workflow id (foreign key)",
                  "description": "WorkflowEventListener workflow id foreign key",
                  "icon": "IconSettingsAutomation",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "3a827a88-014b-488d-85d2-5e0ebbed35fb",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "0cc69985-1fba-4631-9dd0-a2e65016813e",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_9d6a1fb98ccde16ede8c5949d40",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "6b638f96-2b1c-4830-afff-8b33867ef002",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "eeb228e9-5550-497d-961a-ee96983d6c9d"
                        }
                      }
                    ]
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
          "id": "af4e5bad-fa25-46ab-b32e-1147b5210107",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "8c6fe2b6-1a6a-438b-af6f-7d928215c8a9",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": "C",
          "isLabelSyncedWithName": false,
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
                  "id": "642dedcf-1ba1-45f4-9a66-ca1aa492e075",
                  "type": FieldMetadataType.Relation,
                  "name": "noteTargets",
                  "label": "Notes",
                  "description": "Notes tied to the company",
                  "icon": "IconNotes",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "f7894817-6567-44a9-a006-2eae13eee010",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "af4e5bad-fa25-46ab-b32e-1147b5210107",
                      "nameSingular": "company",
                      "namePlural": "companies"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "642dedcf-1ba1-45f4-9a66-ca1aa492e075",
                      "name": "noteTargets"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "01d676a5-d7e9-4d21-98a4-fbaccfa7ffdf",
                      "nameSingular": "noteTarget",
                      "namePlural": "noteTargets"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "7df89c3c-90bd-40ef-bbc9-289c119f1fd8",
                      "name": "company"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "a6780762-90eb-47c4-9b63-9227d25ce311",
                  "type": FieldMetadataType.Position,
                  "name": "position",
                  "label": "Position",
                  "description": "Company record position",
                  "icon": "IconHierarchy2",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "340e2bc4-9759-4147-8f9b-5573139c4e02",
                  "type": FieldMetadataType.Boolean,
                  "name": "visaSponsorship",
                  "label": "Visa Sponsorship",
                  "description": "Company's Visa Sponsorship Policy",
                  "icon": "IconBrandVisa",
                  "isCustom": true,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:25.567Z",
                  "updatedAt": "2024-10-30T13:39:25.567Z",
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
                  "id": "d516ba45-592a-4fc8-9922-fbc711455f2e",
                  "type": FieldMetadataType.Actor,
                  "name": "createdBy",
                  "label": "Created by",
                  "description": "The creator of the record",
                  "icon": "IconCreativeCommonsSa",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "d92db552-ee79-459e-9db4-513531ed7033",
                  "type": FieldMetadataType.MultiSelect,
                  "name": "workPolicy",
                  "label": "Work Policy",
                  "description": "Company's Work Policy",
                  "icon": "IconHome",
                  "isCustom": true,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:24.844Z",
                  "updatedAt": "2024-10-30T13:39:24.844Z",
                  "defaultValue": null,
                  "options": [
                    {
                      "id": "d16932bf-4c73-4d35-8d97-f6bde19ed90d",
                      "color": "green",
                      "label": "On-Site",
                      "value": "ON_SITE",
                      "position": 0
                    },
                    {
                      "id": "9a79c27e-5459-4423-8548-5d2c38f88e95",
                      "color": "turquoise",
                      "label": "Hybrid",
                      "value": "HYBRID",
                      "position": 1
                    },
                    {
                      "id": "95f90eb1-c8ee-4f1d-8249-2f773a4c0372",
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
                  "id": "fd40372d-0805-4d54-a848-45b35c5ec4c7",
                  "type": FieldMetadataType.Relation,
                  "name": "timelineActivities",
                  "label": "Timeline Activities",
                  "description": "Timeline Activities linked to the company",
                  "icon": "IconIconTimelineEvent",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "267d91a0-27bf-4da8-a453-37b80e9553ab",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "af4e5bad-fa25-46ab-b32e-1147b5210107",
                      "nameSingular": "company",
                      "namePlural": "companies"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "fd40372d-0805-4d54-a848-45b35c5ec4c7",
                      "name": "timelineActivities"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "082301c2-cd4d-4cdf-ab5a-98a71d493036",
                      "nameSingular": "timelineActivity",
                      "namePlural": "timelineActivities"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "9febbd65-1690-4221-90d4-0da74f755899",
                      "name": "company"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "ea7e9ce5-c5f7-404e-9439-ad9edf5d03cf",
                  "type": FieldMetadataType.Relation,
                  "name": "people",
                  "label": "People",
                  "description": "People linked to the company.",
                  "icon": "IconUsers",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "66654d28-8ce1-4750-8bd3-ba30a97af1eb",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "af4e5bad-fa25-46ab-b32e-1147b5210107",
                      "nameSingular": "company",
                      "namePlural": "companies"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "ea7e9ce5-c5f7-404e-9439-ad9edf5d03cf",
                      "name": "people"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "1c05dac8-29f7-4f1e-9f61-579ad0eb647d",
                      "nameSingular": "person",
                      "namePlural": "people"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "334443ec-bfd0-4492-8edd-9dd7def5f73e",
                      "name": "company"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "982f72bf-715d-4fdb-b201-df171280f97e",
                  "type": FieldMetadataType.Address,
                  "name": "address",
                  "label": "Address",
                  "description": "Address of the company",
                  "icon": "IconMap",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "eefb9aea-e9a0-4a05-860e-6df52f541399",
                  "type": FieldMetadataType.Links,
                  "name": "domainName",
                  "label": "Domain Name",
                  "description": "The company website URL. We use this url to fetch the company icon",
                  "icon": "IconLink",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "fce51268-dcdd-4e48-ba8e-dd7c140dd3d9",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "fc365a73-e616-4f34-bf2c-cf1564956d82",
                  "type": FieldMetadataType.Boolean,
                  "name": "idealCustomerProfile",
                  "label": "ICP",
                  "description": "Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you",
                  "icon": "IconTarget",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "8447e8fa-bb6c-4a20-9b65-1e833227a0b5",
                  "type": FieldMetadataType.Relation,
                  "name": "taskTargets",
                  "label": "Tasks",
                  "description": "Tasks tied to the company",
                  "icon": "IconCheckbox",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "30fd536e-8ba7-43a1-93f9-b9c68a88f3ac",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "af4e5bad-fa25-46ab-b32e-1147b5210107",
                      "nameSingular": "company",
                      "namePlural": "companies"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "8447e8fa-bb6c-4a20-9b65-1e833227a0b5",
                      "name": "taskTargets"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "84c4f534-4798-47ab-b725-a122e966ae9e",
                      "nameSingular": "taskTarget",
                      "namePlural": "taskTargets"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "a52d3978-f82a-4aa9-ae01-72e969eb2423",
                      "name": "company"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "f39f993a-028d-4d7c-a5a7-46b11b9fdd13",
                  "type": FieldMetadataType.TsVector,
                  "name": "searchVector",
                  "label": "Search vector",
                  "description": "Field used for full-text search",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "6010c754-f6f7-4c35-ad8a-62acc2ae40c4",
                  "type": FieldMetadataType.Currency,
                  "name": "annualRecurringRevenue",
                  "label": "ARR",
                  "description": "Annual Recurring Revenue: The actual or estimated annual revenue of the company",
                  "icon": "IconMoneybag",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "029aa48f-d842-4120-9ad1-ded40547ac61",
                  "type": FieldMetadataType.Relation,
                  "name": "opportunities",
                  "label": "Opportunities",
                  "description": "Opportunities linked to the company.",
                  "icon": "IconTargetArrow",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "ca9f7a40-30f1-4f83-a8cc-6bdd30ad8056",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "af4e5bad-fa25-46ab-b32e-1147b5210107",
                      "nameSingular": "company",
                      "namePlural": "companies"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "029aa48f-d842-4120-9ad1-ded40547ac61",
                      "name": "opportunities"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "e85877ca-dc73-4b9e-b9b7-139dc06ca7b7",
                      "nameSingular": "opportunity",
                      "namePlural": "opportunities"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "92d11fd5-ea02-4d32-a737-411fac9fd8b5",
                      "name": "company"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "7ccaacd6-d980-47a0-8541-0d3aa4794d88",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "b58023d5-18ab-4ef6-9d7a-d2ca06d3ddb9",
                  "type": FieldMetadataType.Links,
                  "name": "introVideo",
                  "label": "Intro Video",
                  "description": "Company's Intro Video",
                  "icon": "IconVideo",
                  "isCustom": true,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:24.028Z",
                  "updatedAt": "2024-10-30T13:39:24.028Z",
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
                  "id": "53fc0161-cf55-4c8e-bf86-64197868a89a",
                  "type": FieldMetadataType.Relation,
                  "name": "attachments",
                  "label": "Attachments",
                  "description": "Attachments linked to the company",
                  "icon": "IconFileImport",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "06685252-e45f-4be7-b26c-4cef8f9f1bf6",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "af4e5bad-fa25-46ab-b32e-1147b5210107",
                      "nameSingular": "company",
                      "namePlural": "companies"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "53fc0161-cf55-4c8e-bf86-64197868a89a",
                      "name": "attachments"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "ba95cbd9-694f-4ae5-906d-1f7cd213c9fe",
                      "nameSingular": "attachment",
                      "namePlural": "attachments"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "12eb10d6-2890-4c94-a278-5e94f9dd3d3e",
                      "name": "company"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "28e14cf6-e26a-4040-bf37-e4b7a4c05f7c",
                  "type": FieldMetadataType.Number,
                  "name": "employees",
                  "label": "Employees",
                  "description": "Number of employees in the company",
                  "icon": "IconUsers",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "2b22336f-343c-441a-adae-52091d1cb67e",
                  "type": FieldMetadataType.Text,
                  "name": "tagline",
                  "label": "Tagline",
                  "description": "Company's Tagline",
                  "icon": "IconAdCircle",
                  "isCustom": true,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:23.146Z",
                  "updatedAt": "2024-10-30T13:39:23.146Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "4bea46f2-a4c1-4730-a1c6-d2c3cf3edd6c",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "b084ffaf-20c5-406b-af22-9c0944e6c688",
                  "type": FieldMetadataType.Relation,
                  "name": "accountOwner",
                  "label": "Account Owner",
                  "description": "Your team member responsible for managing the company account",
                  "icon": "IconUserCircle",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "62947494-1253-4c6a-82a5-df867a406b55",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "af4e5bad-fa25-46ab-b32e-1147b5210107",
                      "nameSingular": "company",
                      "namePlural": "companies"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "b084ffaf-20c5-406b-af22-9c0944e6c688",
                      "name": "accountOwner"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "a6ae81d6-b50b-4183-a2bb-ebcc0428dd53",
                      "nameSingular": "workspaceMember",
                      "namePlural": "workspaceMembers"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "dfecc528-6d16-4400-8ffe-edd65300f36c",
                      "name": "accountOwnerForCompanies"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "74943406-a574-42b4-9ce0-9890c04c6e7d",
                  "type": FieldMetadataType.Links,
                  "name": "linkedinLink",
                  "label": "Linkedin",
                  "description": "The company Linkedin account",
                  "icon": "IconBrandLinkedin",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "22f3c2c1-124f-4304-861c-4aad29a00bd4",
                  "type": FieldMetadataType.Relation,
                  "name": "favorites",
                  "label": "Favorites",
                  "description": "Favorites linked to the company",
                  "icon": "IconHeart",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "825c3208-3eb6-47e6-bc5f-6e8b12d56923",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "af4e5bad-fa25-46ab-b32e-1147b5210107",
                      "nameSingular": "company",
                      "namePlural": "companies"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "22f3c2c1-124f-4304-861c-4aad29a00bd4",
                      "name": "favorites"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "6d72fd09-755d-409b-8455-f74da70fa9c1",
                      "nameSingular": "favorite",
                      "namePlural": "favorites"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "19748dd4-4c79-4d32-ade4-1937d7c6a05f",
                      "name": "company"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "092990bf-ff31-4d01-9ac9-7ee1fc7cb150",
                  "type": FieldMetadataType.Links,
                  "name": "xLink",
                  "label": "X",
                  "description": "The company Twitter/X account",
                  "icon": "IconBrandX",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "b0dc7f14-732a-41d5-8bf8-471a98ae9eb9",
                  "type": FieldMetadataType.Uuid,
                  "name": "accountOwnerId",
                  "label": "Account Owner id (foreign key)",
                  "description": "Your team member responsible for managing the company account id foreign key",
                  "icon": "IconUserCircle",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "2b4baf1c-164e-4ad9-b3ac-a44a50907411",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "8c6fe2b6-1a6a-438b-af6f-7d928215c8a9",
                  "type": FieldMetadataType.Text,
                  "name": "name",
                  "label": "Name",
                  "description": "The company name",
                  "icon": "IconBuildingSkyscraper",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "16d86822-f2d0-4d1b-9866-e006e54a7cba",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_fb1f4905546cfc6d70a971c76f7",
                  "indexWhereClause": null,
                  "indexType": IndexType.Gin,
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
                  "id": "8a8052ee-3bfb-4817-a8a1-623ec1d90e6f",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_123501237187c835ede626367b7",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "a0a39cdf-0e03-4afe-99fa-9cfe5064fc4e",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "b0dc7f14-732a-41d5-8bf8-471a98ae9eb9"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "6c9e8d17-5b71-427d-935c-056160018a69",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "fce51268-dcdd-4e48-ba8e-dd7c140dd3d9"
                        }
                      }
                    ]
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
          "id": "a9e16af5-593f-42a6-b311-e0dd391b416b",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "7eee2c87-58f7-411c-b546-df594841314a",
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
                  "id": "7eee2c87-58f7-411c-b546-df594841314a",
                  "type": FieldMetadataType.Text,
                  "name": "name",
                  "label": "Name",
                  "description": "ApiKey name",
                  "icon": "IconLink",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "24ec5812-fdc5-434c-b7ac-6b1d3624e7b4",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "6df1d2d6-992c-4989-9f49-12aad95a1c3d",
                  "type": FieldMetadataType.DateTime,
                  "name": "expiresAt",
                  "label": "Expiration date",
                  "description": "ApiKey expiration date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "fb3545ad-325c-4266-98ae-19b9185a5ceb",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "03e78250-9a5f-4b50-a1e6-ab55f6888e1b",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "db15aa7f-8374-486f-877f-7836956fe93d",
                  "type": FieldMetadataType.DateTime,
                  "name": "revokedAt",
                  "label": "Revocation date",
                  "description": "ApiKey revocation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "e87822c9-b2cf-4e69-902e-982b4c9a3087",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
          "id": "a6ae81d6-b50b-4183-a2bb-ebcc0428dd53",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "f65f22df-6e89-4dd8-b33b-2d888f869c6d",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "611f0f9b-d4d3-42b6-9bb5-ab8d33e3befc",
                  "type": FieldMetadataType.Relation,
                  "name": "assignedTasks",
                  "label": "Assigned tasks",
                  "description": "Tasks assigned to the workspace member",
                  "icon": "IconCheckbox",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "ea04a6cc-b565-4da2-afff-fade0a20d08d",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "a6ae81d6-b50b-4183-a2bb-ebcc0428dd53",
                      "nameSingular": "workspaceMember",
                      "namePlural": "workspaceMembers"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "611f0f9b-d4d3-42b6-9bb5-ab8d33e3befc",
                      "name": "assignedTasks"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "25e10253-f0e1-4a6d-90e3-ad62a4b20292",
                      "nameSingular": "task",
                      "namePlural": "tasks"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "598b87cb-3d76-43e8-a4fa-beb10772f675",
                      "name": "assignee"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "f65f22df-6e89-4dd8-b33b-2d888f869c6d",
                  "type": FieldMetadataType.FullName,
                  "name": "name",
                  "label": "Name",
                  "description": "Workspace member name",
                  "icon": "IconCircleUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "68f9360e-d2f2-4d48-9292-a877bc7729d1",
                  "type": FieldMetadataType.Uuid,
                  "name": "userId",
                  "label": "User Id",
                  "description": "Associated User Id",
                  "icon": "IconCircleUsers",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "759429eb-226b-49b7-84b7-c516b967be1b",
                  "type": FieldMetadataType.Select,
                  "name": "timeFormat",
                  "label": "Time format",
                  "description": "User's preferred time format",
                  "icon": "IconClock2",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "'SYSTEM'",
                  "options": [
                    {
                      "id": "2fc2338f-9e3d-4d5b-b78f-0c32070d404f",
                      "color": "sky",
                      "label": "System",
                      "value": "SYSTEM",
                      "position": 0
                    },
                    {
                      "id": "d27d4d75-7198-4e35-ad00-d5dcea62d2b9",
                      "color": "red",
                      "label": "24HRS",
                      "value": "HOUR_24",
                      "position": 1
                    },
                    {
                      "id": "2f9e0b4b-1fae-4c95-b2c0-f324427d8f66",
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
                  "id": "355b43d4-5576-4a56-b4c1-2819910348e6",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "f5d083df-99d2-4a0d-b8a0-8158c0eaf1ed",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "a71b33d8-b2d5-46be-afe5-f3f0d82c4385",
                  "type": FieldMetadataType.Text,
                  "name": "avatarUrl",
                  "label": "Avatar Url",
                  "description": "Workspace member avatar",
                  "icon": "IconFileUpload",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "8c8a64e1-dc5f-4523-a216-af06910653b0",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "ce8cc8f8-5923-4e04-bdc4-0b4728990e2d",
                  "type": FieldMetadataType.Text,
                  "name": "timeZone",
                  "label": "Time zone",
                  "description": "User time zone",
                  "icon": "IconTimezone",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "b0a371af-199c-4d76-b16f-08cd67f33f13",
                  "type": FieldMetadataType.Relation,
                  "name": "connectedAccounts",
                  "label": "Connected accounts",
                  "description": "Connected accounts",
                  "icon": "IconAt",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "1dd4ab3f-43a8-44a3-8676-3c6298a5428b",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "a6ae81d6-b50b-4183-a2bb-ebcc0428dd53",
                      "nameSingular": "workspaceMember",
                      "namePlural": "workspaceMembers"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "b0a371af-199c-4d76-b16f-08cd67f33f13",
                      "name": "connectedAccounts"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "5c1e17cb-3ed9-4024-b427-fe576d6ce3d1",
                      "nameSingular": "connectedAccount",
                      "namePlural": "connectedAccounts"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "12864caa-e6cc-450f-919d-a706fdb7b95f",
                      "name": "accountOwner"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "08caaae1-0bd7-411c-9af1-72d4169976f0",
                  "type": FieldMetadataType.Relation,
                  "name": "favorites",
                  "label": "Favorites",
                  "description": "Favorites linked to the workspace member",
                  "icon": "IconHeart",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "99e09c7d-bc02-4b11-b602-93e36a1f2b96",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "a6ae81d6-b50b-4183-a2bb-ebcc0428dd53",
                      "nameSingular": "workspaceMember",
                      "namePlural": "workspaceMembers"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "08caaae1-0bd7-411c-9af1-72d4169976f0",
                      "name": "favorites"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "6d72fd09-755d-409b-8455-f74da70fa9c1",
                      "nameSingular": "favorite",
                      "namePlural": "favorites"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "25069fed-0167-4301-bab5-48d686bb78ac",
                      "name": "workspaceMember"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "dfecc528-6d16-4400-8ffe-edd65300f36c",
                  "type": FieldMetadataType.Relation,
                  "name": "accountOwnerForCompanies",
                  "label": "Account Owner For Companies",
                  "description": "Account owner for companies",
                  "icon": "IconBriefcase",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "62947494-1253-4c6a-82a5-df867a406b55",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "a6ae81d6-b50b-4183-a2bb-ebcc0428dd53",
                      "nameSingular": "workspaceMember",
                      "namePlural": "workspaceMembers"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "dfecc528-6d16-4400-8ffe-edd65300f36c",
                      "name": "accountOwnerForCompanies"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "af4e5bad-fa25-46ab-b32e-1147b5210107",
                      "nameSingular": "company",
                      "namePlural": "companies"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "b084ffaf-20c5-406b-af22-9c0944e6c688",
                      "name": "accountOwner"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "11c496ea-56e3-48e6-8ff9-09e287ce61dd",
                  "type": FieldMetadataType.Text,
                  "name": "userEmail",
                  "label": "User Email",
                  "description": "Related user email address",
                  "icon": "IconMail",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "ccafab52-bde9-4ada-aa5d-d5e30c63186f",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "dff91df5-36ed-421f-ae00-280e9f7ac50d",
                  "type": FieldMetadataType.Relation,
                  "name": "timelineActivities",
                  "label": "Events",
                  "description": "Events linked to the workspace member",
                  "icon": "IconTimelineEvent",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "85f3aac1-28c3-4e62-b1b8-1e4741b13285",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "a6ae81d6-b50b-4183-a2bb-ebcc0428dd53",
                      "nameSingular": "workspaceMember",
                      "namePlural": "workspaceMembers"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "dff91df5-36ed-421f-ae00-280e9f7ac50d",
                      "name": "timelineActivities"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "082301c2-cd4d-4cdf-ab5a-98a71d493036",
                      "nameSingular": "timelineActivity",
                      "namePlural": "timelineActivities"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "0a7b67cf-5f49-4873-a617-6c6ccd47dd39",
                      "name": "workspaceMember"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "cfe91d89-2f0b-44e0-85f2-4c3fcc2b0fc2",
                  "type": FieldMetadataType.Relation,
                  "name": "blocklist",
                  "label": "Blocklist",
                  "description": "Blocklisted handles",
                  "icon": "IconForbid2",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "2bb7561a-2f23-4b9a-b45e-6fa3fcc7e7dc",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "a6ae81d6-b50b-4183-a2bb-ebcc0428dd53",
                      "nameSingular": "workspaceMember",
                      "namePlural": "workspaceMembers"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "cfe91d89-2f0b-44e0-85f2-4c3fcc2b0fc2",
                      "name": "blocklist"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "91e79010-c2a5-48e7-aced-56c702ffcbbf",
                      "nameSingular": "blocklist",
                      "namePlural": "blocklists"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "3a2dd1b1-b625-4e8b-a609-53f0496f8d9b",
                      "name": "workspaceMember"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "612338fe-45ea-444b-845e-a2d049b86f80",
                  "type": FieldMetadataType.Relation,
                  "name": "authoredAttachments",
                  "label": "Authored attachments",
                  "description": "Attachments created by the workspace member",
                  "icon": "IconFileImport",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "032b61bb-ee5d-4996-8988-644cd785f0d5",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "a6ae81d6-b50b-4183-a2bb-ebcc0428dd53",
                      "nameSingular": "workspaceMember",
                      "namePlural": "workspaceMembers"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "612338fe-45ea-444b-845e-a2d049b86f80",
                      "name": "authoredAttachments"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "ba95cbd9-694f-4ae5-906d-1f7cd213c9fe",
                      "nameSingular": "attachment",
                      "namePlural": "attachments"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "cdf24ecd-536b-430c-a5d5-01d875f6d72d",
                      "name": "author"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "def816a8-d43b-4e12-8374-c6b633e8b5c8",
                  "type": FieldMetadataType.Select,
                  "name": "dateFormat",
                  "label": "Date format",
                  "description": "User's preferred date format",
                  "icon": "IconCalendarEvent",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "'SYSTEM'",
                  "options": [
                    {
                      "id": "75f35dd6-4db3-4f14-bb81-8d47b91e2e4a",
                      "color": "turquoise",
                      "label": "System",
                      "value": "SYSTEM",
                      "position": 0
                    },
                    {
                      "id": "dd46d745-6ee6-43f7-93af-f9d1e2d988a6",
                      "color": "red",
                      "label": "Month First",
                      "value": "MONTH_FIRST",
                      "position": 1
                    },
                    {
                      "id": "5625cd7a-85fc-491d-ac81-4b4d1c2aefb8",
                      "color": "purple",
                      "label": "Day First",
                      "value": "DAY_FIRST",
                      "position": 2
                    },
                    {
                      "id": "b8120045-04f1-4128-adaf-ab75368b4698",
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
                  "id": "57429b6b-c02c-407d-bad3-3a891b8f9e69",
                  "type": FieldMetadataType.TsVector,
                  "name": "searchVector",
                  "label": "Search vector",
                  "description": "Field used for full-text search",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "2ac0f031-4d2a-4cb1-927f-3b32c9e03912",
                  "type": FieldMetadataType.Relation,
                  "name": "calendarEventParticipants",
                  "label": "Calendar Event Participants",
                  "description": "Calendar Event Participants",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "50ab4e40-3ac5-450d-92ed-5443e2854aa3",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "a6ae81d6-b50b-4183-a2bb-ebcc0428dd53",
                      "nameSingular": "workspaceMember",
                      "namePlural": "workspaceMembers"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "2ac0f031-4d2a-4cb1-927f-3b32c9e03912",
                      "name": "calendarEventParticipants"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "5706c0cc-9d33-4bb8-8b6d-db74b8d882c8",
                      "nameSingular": "calendarEventParticipant",
                      "namePlural": "calendarEventParticipants"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "6cfcc8ed-1a98-4669-a763-f1c8f1b04b78",
                      "name": "workspaceMember"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "e2e10ea8-6dda-42fa-b60b-cde77e92989c",
                  "type": FieldMetadataType.Text,
                  "name": "colorScheme",
                  "label": "Color Scheme",
                  "description": "Preferred color scheme",
                  "icon": "IconColorSwatch",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "670a1d1c-10b9-443a-b7f2-5fcea0aee569",
                  "type": FieldMetadataType.Text,
                  "name": "locale",
                  "label": "Language",
                  "description": "Preferred language",
                  "icon": "IconLanguage",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "4503ee75-9eb3-44cc-b0d9-210564fcb07f",
                  "type": FieldMetadataType.Relation,
                  "name": "auditLogs",
                  "label": "Audit Logs",
                  "description": "Audit Logs linked to the workspace member",
                  "icon": "IconTimelineEvent",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "fd855e53-1a54-4db4-a76e-79d0f7883a61",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "a6ae81d6-b50b-4183-a2bb-ebcc0428dd53",
                      "nameSingular": "workspaceMember",
                      "namePlural": "workspaceMembers"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "4503ee75-9eb3-44cc-b0d9-210564fcb07f",
                      "name": "auditLogs"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "9d5a1b62-af03-48da-b050-3680604005a9",
                      "nameSingular": "auditLog",
                      "namePlural": "auditLogs"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "77675697-756f-439d-8989-d4e51f4b7b6c",
                      "name": "workspaceMember"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "0acbe745-ae2d-4aac-a40d-0fb42b54c75f",
                  "type": FieldMetadataType.Relation,
                  "name": "messageParticipants",
                  "label": "Message Participants",
                  "description": "Message Participants",
                  "icon": "IconUserCircle",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "401899ac-1ea1-4b2a-bc9f-e8dbc0376245",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "a6ae81d6-b50b-4183-a2bb-ebcc0428dd53",
                      "nameSingular": "workspaceMember",
                      "namePlural": "workspaceMembers"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "0acbe745-ae2d-4aac-a40d-0fb42b54c75f",
                      "name": "messageParticipants"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "3afda1a8-e7ea-45e9-9c0c-f744ace5c20d",
                      "nameSingular": "messageParticipant",
                      "namePlural": "messageParticipants"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "a2b20d09-a23b-4de0-9ca8-2f1877a0f6d9",
                      "name": "workspaceMember"
                    }
                  }
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "4c92da4e-c21f-41b0-b43f-b033b0ea0ff7",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_e47451872f70c8f187a6b460ac7",
                  "indexWhereClause": null,
                  "indexType": IndexType.Gin,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "13bcb993-4f72-45aa-99dd-0ed584431b0a",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "57429b6b-c02c-407d-bad3-3a891b8f9e69"
                        }
                      }
                    ]
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
          "id": "a031797c-fd59-4072-bad0-0f17a6236871",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "d613c5b5-66c9-4763-ab1c-c4a9889a57c7",
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
                  "id": "d613c5b5-66c9-4763-ab1c-c4a9889a57c7",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "b66765d7-0e02-4daa-beb2-771a399a33be",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "5874543d-b861-466f-94d5-c78bed9da308",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "80d446e6-93fa-48ae-8cd7-b8369b2a4feb",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "2df434a7-1218-409a-91a9-9030eccf3e25",
                  "type": FieldMetadataType.Relation,
                  "name": "messages",
                  "label": "Messages",
                  "description": "Messages from the thread.",
                  "icon": "IconMessage",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "4499287d-ffad-4966-a043-e5fecd6489a9",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "a031797c-fd59-4072-bad0-0f17a6236871",
                      "nameSingular": "messageThread",
                      "namePlural": "messageThreads"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "2df434a7-1218-409a-91a9-9030eccf3e25",
                      "name": "messages"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "3385d352-10a0-428f-9863-e52e7164b26c",
                      "nameSingular": "message",
                      "namePlural": "messages"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "79d2deca-9d03-4cf5-a618-2b0afe85c37d",
                      "name": "messageThread"
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
          "id": "9d5a1b62-af03-48da-b050-3680604005a9",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
          "nameSingular": "auditLog",
          "namePlural": "auditLogs",
          "labelSingular": "Audit Log",
          "labelPlural": "Audit Logs",
          "description": "An audit log of actions performed in the system",
          "icon": "IconTimelineEvent",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "17732eff-a71c-456a-89ec-fe94fe811440",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "369f1f4d-f14c-471a-9076-410ae7126b17",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "079fd4b7-e632-470e-b8db-8fb7232e0c2a",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "b5760bd0-ce2f-4961-ba1c-788dd7258100",
                  "type": FieldMetadataType.Text,
                  "name": "objectName",
                  "label": "Object name",
                  "description": "Object name",
                  "icon": "IconAbc",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "17732eff-a71c-456a-89ec-fe94fe811440",
                  "type": FieldMetadataType.Text,
                  "name": "name",
                  "label": "Event name",
                  "description": "Event name/type",
                  "icon": "IconAbc",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "38d2cf2f-2bec-46a2-b3ab-2597e9f1ab6d",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "e9afab55-6c9e-4bf1-a7bb-3d667177dd96",
                  "type": FieldMetadataType.Text,
                  "name": "objectMetadataId",
                  "label": "Object metadata id",
                  "description": "Object metadata id",
                  "icon": "IconAbc",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "9e8662d3-dc30-4d69-85e0-56bdd0004867",
                  "type": FieldMetadataType.Uuid,
                  "name": "workspaceMemberId",
                  "label": "Workspace Member id (foreign key)",
                  "description": "Event workspace member id foreign key",
                  "icon": "IconCircleUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "77675697-756f-439d-8989-d4e51f4b7b6c",
                  "type": FieldMetadataType.Relation,
                  "name": "workspaceMember",
                  "label": "Workspace Member",
                  "description": "Event workspace member",
                  "icon": "IconCircleUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "fd855e53-1a54-4db4-a76e-79d0f7883a61",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "9d5a1b62-af03-48da-b050-3680604005a9",
                      "nameSingular": "auditLog",
                      "namePlural": "auditLogs"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "77675697-756f-439d-8989-d4e51f4b7b6c",
                      "name": "workspaceMember"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "a6ae81d6-b50b-4183-a2bb-ebcc0428dd53",
                      "nameSingular": "workspaceMember",
                      "namePlural": "workspaceMembers"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "4503ee75-9eb3-44cc-b0d9-210564fcb07f",
                      "name": "auditLogs"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "fcbaf317-502c-4718-8c39-5b1ca8705636",
                  "type": FieldMetadataType.RawJson,
                  "name": "context",
                  "label": "Event context",
                  "description": "Json object to provide context (user, device, workspace, etc.)",
                  "icon": "IconListDetails",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "817041f1-c4c8-4f46-9f8d-c10345b0b63a",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "83c5204c-451d-498b-afd4-3ac735cecf08",
                  "type": FieldMetadataType.Uuid,
                  "name": "recordId",
                  "label": "Record id",
                  "description": "Record id",
                  "icon": "IconAbc",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "3a5e3557-d40c-4850-b67e-7bd6b9e26ca3",
                  "type": FieldMetadataType.RawJson,
                  "name": "properties",
                  "label": "Event details",
                  "description": "Json value for event details",
                  "icon": "IconListDetails",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "82bd9b00-cc6c-428f-b959-1219858fd0b5",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_ca389a7ad7595bb15d733535998",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": []
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
          "id": "91e79010-c2a5-48e7-aced-56c702ffcbbf",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "2996ffff-3796-4728-adc2-5b2ddd4770f4",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "f50f8926-0828-4017-b42a-33e3ff5bde1a",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "caa14977-89cb-4a0e-9cd2-c69c14e7bc0b",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "3a2dd1b1-b625-4e8b-a609-53f0496f8d9b",
                  "type": FieldMetadataType.Relation,
                  "name": "workspaceMember",
                  "label": "WorkspaceMember",
                  "description": "WorkspaceMember",
                  "icon": "IconCircleUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "2bb7561a-2f23-4b9a-b45e-6fa3fcc7e7dc",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "91e79010-c2a5-48e7-aced-56c702ffcbbf",
                      "nameSingular": "blocklist",
                      "namePlural": "blocklists"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "3a2dd1b1-b625-4e8b-a609-53f0496f8d9b",
                      "name": "workspaceMember"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "a6ae81d6-b50b-4183-a2bb-ebcc0428dd53",
                      "nameSingular": "workspaceMember",
                      "namePlural": "workspaceMembers"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "cfe91d89-2f0b-44e0-85f2-4c3fcc2b0fc2",
                      "name": "blocklist"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "126e0a95-6f99-49f4-b5e4-76962aa1917d",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "4cbe4a8d-ad60-4229-a195-957af7176bbe",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "2996ffff-3796-4728-adc2-5b2ddd4770f4",
                  "type": FieldMetadataType.Text,
                  "name": "handle",
                  "label": "Handle",
                  "description": "Handle",
                  "icon": "IconAt",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "1cfa16a2-5045-4c79-a0bf-781f0ad673c1",
                  "type": FieldMetadataType.Uuid,
                  "name": "workspaceMemberId",
                  "label": "WorkspaceMember id (foreign key)",
                  "description": "WorkspaceMember id foreign key",
                  "icon": "IconCircleUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "3d1ebd88-7580-4b75-af2d-1ad60c363c84",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_76a190ab8a6f439791358d63d60",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "d2ac1a86-2797-420b-a117-6b14538ab702",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "f50f8926-0828-4017-b42a-33e3ff5bde1a"
                        }
                      }
                    ]
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
          "id": "8ee31473-4b30-4870-bcaa-92d77ad56bb6",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "f5cbbd97-3b91-4cd0-b9de-27e510c98dcc",
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
                  "id": "e5fa8aec-caf5-4334-8c39-d8f3eebfaabe",
                  "type": FieldMetadataType.Relation,
                  "name": "timelineActivities",
                  "label": "Timeline Activities",
                  "description": "Timeline activities linked to the workflow",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "143ea000-9a6f-4f1d-8c19-38f1c05ce3a7",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "8ee31473-4b30-4870-bcaa-92d77ad56bb6",
                      "nameSingular": "workflow",
                      "namePlural": "workflows"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "e5fa8aec-caf5-4334-8c39-d8f3eebfaabe",
                      "name": "timelineActivities"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "082301c2-cd4d-4cdf-ab5a-98a71d493036",
                      "nameSingular": "timelineActivity",
                      "namePlural": "timelineActivities"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "aac285c9-3c46-4bd2-b110-047a7d21ad13",
                      "name": "workflow"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "77965140-284f-4be9-950c-cdfcf1fe0ac3",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "eef4ac2b-0768-4241-bb7e-4d09d98afe88",
                  "type": FieldMetadataType.MultiSelect,
                  "name": "statuses",
                  "label": "Statuses",
                  "description": "The current statuses of the workflow versions",
                  "icon": "IconStatusChange",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "f5cbbd97-3b91-4cd0-b9de-27e510c98dcc",
                  "type": FieldMetadataType.Text,
                  "name": "name",
                  "label": "Name",
                  "description": "The workflow name",
                  "icon": "IconSettingsAutomation",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "91077fc1-8c52-4580-bfe7-f4ae97e4c575",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "3a400bcf-4885-4f3d-b813-38ba888b368e",
                  "type": FieldMetadataType.Text,
                  "name": "lastPublishedVersionId",
                  "label": "Last published Version Id",
                  "description": "The workflow last published version id",
                  "icon": "IconVersions",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "e5cd9745-d76a-4ebd-b1dd-d10bb55fbb3d",
                  "type": FieldMetadataType.Relation,
                  "name": "favorites",
                  "label": "Favorites",
                  "description": "Favorites linked to the workflow",
                  "icon": "IconHeart",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "34fba28a-888e-496e-b7d1-f621479c4647",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "8ee31473-4b30-4870-bcaa-92d77ad56bb6",
                      "nameSingular": "workflow",
                      "namePlural": "workflows"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "e5cd9745-d76a-4ebd-b1dd-d10bb55fbb3d",
                      "name": "favorites"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "6d72fd09-755d-409b-8455-f74da70fa9c1",
                      "nameSingular": "favorite",
                      "namePlural": "favorites"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "f9355fc1-f4a5-41ec-a2ec-92d50d4eccae",
                      "name": "workflow"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "cd34b70c-4736-4ac3-b95d-0139d4f4f1bc",
                  "type": FieldMetadataType.Relation,
                  "name": "runs",
                  "label": "Runs",
                  "description": "Workflow runs linked to the workflow.",
                  "icon": "IconRun",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "65095364-7e71-4813-aeea-c467435e0cb9",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "8ee31473-4b30-4870-bcaa-92d77ad56bb6",
                      "nameSingular": "workflow",
                      "namePlural": "workflows"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "cd34b70c-4736-4ac3-b95d-0139d4f4f1bc",
                      "name": "runs"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "87ef9245-2665-45db-8193-b6d216b5df50",
                      "nameSingular": "workflowRun",
                      "namePlural": "workflowRuns"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "00a542d7-4b97-4f56-b07d-cfd73dbc7239",
                      "name": "workflow"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "27b31a92-d137-48e0-8abe-a979a92bd486",
                  "type": FieldMetadataType.Relation,
                  "name": "eventListeners",
                  "label": "Event Listeners",
                  "description": "Workflow event listeners linked to the workflow.",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "6208cf61-25fa-4660-9b39-ea1e52aa23c8",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "8ee31473-4b30-4870-bcaa-92d77ad56bb6",
                      "nameSingular": "workflow",
                      "namePlural": "workflows"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "27b31a92-d137-48e0-8abe-a979a92bd486",
                      "name": "eventListeners"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "b62c1e5e-cb2c-4f66-bd0a-777ea6198ca8",
                      "nameSingular": "workflowEventListener",
                      "namePlural": "workflowEventListeners"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "743d0810-9a03-4481-8397-716c3c7fe3b9",
                      "name": "workflow"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "a94ec13e-6d0c-4df4-a52c-3a46c9420369",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "01508898-496f-4256-bc88-a907faedc424",
                  "type": FieldMetadataType.Relation,
                  "name": "versions",
                  "label": "Versions",
                  "description": "Workflow versions linked to the workflow.",
                  "icon": "IconVersions",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "6425441d-49f2-4cb5-a9e2-f4acce604da4",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "8ee31473-4b30-4870-bcaa-92d77ad56bb6",
                      "nameSingular": "workflow",
                      "namePlural": "workflows"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "01508898-496f-4256-bc88-a907faedc424",
                      "name": "versions"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "fad28eb7-a085-4917-93b3-579afd54f373",
                      "nameSingular": "workflowVersion",
                      "namePlural": "workflowVersions"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "2b8f293d-d90c-4796-8324-8a6fef5334fb",
                      "name": "workflow"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "7abf7d15-4a71-444b-bb87-89ddffa26f08",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "461c770b-3c4e-41f0-ae57-bcc500df76d5",
                  "type": FieldMetadataType.Position,
                  "name": "position",
                  "label": "Position",
                  "description": "Workflow record position",
                  "icon": "IconHierarchy2",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
          "id": "88520ce4-938b-4d9f-a5ea-61e5e89f767e",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "ee250cd9-9072-49e5-ae89-2456166d10d9",
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
                  "id": "a82f3284-9cd6-4827-8c68-5e2dde6a0c1b",
                  "type": FieldMetadataType.Text,
                  "name": "kanbanFieldMetadataId",
                  "label": "kanbanfieldMetadataId",
                  "description": "View Kanban column field",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "1c0d42dd-1339-4228-9e7c-1fd00d6913f4",
                  "type": FieldMetadataType.Relation,
                  "name": "viewGroups",
                  "label": "View Groups",
                  "description": "View Groups",
                  "icon": "IconTag",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "af260d5e-13f4-4e6a-bf9f-9790d4335ea4",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "88520ce4-938b-4d9f-a5ea-61e5e89f767e",
                      "nameSingular": "view",
                      "namePlural": "views"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "1c0d42dd-1339-4228-9e7c-1fd00d6913f4",
                      "name": "viewGroups"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "f46b3fd8-c78d-4203-acf3-dec44e6a0330",
                      "nameSingular": "viewGroup",
                      "namePlural": "viewGroups"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "66a8054a-4d36-49af-bd29-c48c63383c95",
                      "name": "view"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "8ea5df10-7aaf-417f-b131-e18c902b7330",
                  "type": FieldMetadataType.Relation,
                  "name": "viewSorts",
                  "label": "View Sorts",
                  "description": "View Sorts",
                  "icon": "IconArrowsSort",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "a76af472-0c5f-420c-8f7a-96827675d084",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "88520ce4-938b-4d9f-a5ea-61e5e89f767e",
                      "nameSingular": "view",
                      "namePlural": "views"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "8ea5df10-7aaf-417f-b131-e18c902b7330",
                      "name": "viewSorts"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "c0242465-7a74-439d-9b8c-60737c781e3f",
                      "nameSingular": "viewSort",
                      "namePlural": "viewSorts"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "eb4e0589-4d58-4ded-9261-7f91c75b4ef5",
                      "name": "view"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "45bf17e3-2046-41a5-8f94-3da579a7b818",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "69cfdcf9-7eb3-4f8c-b3df-67a70727580e",
                  "type": FieldMetadataType.Text,
                  "name": "type",
                  "label": "Type",
                  "description": "View type",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "4dfaac45-6810-4444-a822-8c5b8983dd4b",
                  "type": FieldMetadataType.Boolean,
                  "name": "isCompact",
                  "label": "Compact View",
                  "description": "Describes if the view is in compact mode",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "fd272255-57dd-45c8-a2bf-a8da59f15e85",
                  "type": FieldMetadataType.Select,
                  "name": "key",
                  "label": "Key",
                  "description": "View key",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "'INDEX'",
                  "options": [
                    {
                      "id": "28ad717c-c82c-408c-a651-7b9dab217787",
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
                  "id": "b9a7d42c-2147-4d11-a6bc-04766ad30404",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "470c310b-cfe2-4491-8774-11fd24ec38d2",
                  "type": FieldMetadataType.Text,
                  "name": "icon",
                  "label": "Icon",
                  "description": "View icon",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "d7a5d3aa-3975-45ec-8c9b-f7149289a849",
                  "type": FieldMetadataType.Relation,
                  "name": "favorites",
                  "label": "Favorites",
                  "description": "Favorites linked to the view",
                  "icon": "IconHeart",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "bfdbdf10-236c-4048-9965-8a0e16e5fe22",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "88520ce4-938b-4d9f-a5ea-61e5e89f767e",
                      "nameSingular": "view",
                      "namePlural": "views"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "d7a5d3aa-3975-45ec-8c9b-f7149289a849",
                      "name": "favorites"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "6d72fd09-755d-409b-8455-f74da70fa9c1",
                      "nameSingular": "favorite",
                      "namePlural": "favorites"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "0b529980-643b-44f1-a007-328cf99be91a",
                      "name": "view"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "ad547e8a-8363-4834-ae26-5e5c9e92f280",
                  "type": FieldMetadataType.Relation,
                  "name": "viewFilterGroups",
                  "label": "View Filter Groups",
                  "description": "View Filter Groups",
                  "icon": "IconFilterBolt",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "a7eb655c-ce3b-440f-8e8c-53e0f621da61",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "88520ce4-938b-4d9f-a5ea-61e5e89f767e",
                      "nameSingular": "view",
                      "namePlural": "views"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "ad547e8a-8363-4834-ae26-5e5c9e92f280",
                      "name": "viewFilterGroups"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "1b8027e7-e77e-43a9-8b99-ae672f0c2d96",
                      "nameSingular": "viewFilterGroup",
                      "namePlural": "viewFilterGroups"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "5fd33d47-cb5b-4c9d-a05e-e48e89541196",
                      "name": "view"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "c79c0149-a758-40d7-92ed-404fa796ef41",
                  "type": FieldMetadataType.Uuid,
                  "name": "objectMetadataId",
                  "label": "Object Metadata Id",
                  "description": "View target object",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "24a2711c-7273-4abf-bbbb-71ef3b1d25d5",
                  "type": FieldMetadataType.Relation,
                  "name": "viewFields",
                  "label": "View Fields",
                  "description": "View Fields",
                  "icon": "IconTag",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "e44f91d9-a6fc-440f-aa2b-b9b7d5446da6",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "88520ce4-938b-4d9f-a5ea-61e5e89f767e",
                      "nameSingular": "view",
                      "namePlural": "views"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "24a2711c-7273-4abf-bbbb-71ef3b1d25d5",
                      "name": "viewFields"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "68534b8b-9599-4e4b-9fb8-8a3c56adb871",
                      "nameSingular": "viewField",
                      "namePlural": "viewFields"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "f0bee61a-f5a0-4b60-af98-12f854be6127",
                      "name": "view"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "67b796cd-27b9-4a64-a3fb-1d4367e61f98",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "acd41982-5145-460e-8879-e98aa7a09f12",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "ee250cd9-9072-49e5-ae89-2456166d10d9",
                  "type": FieldMetadataType.Text,
                  "name": "name",
                  "label": "Name",
                  "description": "View name",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "72a66df5-81b7-4b38-bc1c-c637b890c9f0",
                  "type": FieldMetadataType.Relation,
                  "name": "viewFilters",
                  "label": "View Filters",
                  "description": "View Filters",
                  "icon": "IconFilterBolt",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "62a743f6-0984-4b49-8e60-1845853db297",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "88520ce4-938b-4d9f-a5ea-61e5e89f767e",
                      "nameSingular": "view",
                      "namePlural": "views"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "72a66df5-81b7-4b38-bc1c-c637b890c9f0",
                      "name": "viewFilters"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "18c81dd7-1656-4cfd-930c-40917a8ebdb1",
                      "nameSingular": "viewFilter",
                      "namePlural": "viewFilters"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "07806fe5-7b74-4c75-b6b9-b31ed34201f8",
                      "name": "view"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "13b1d755-2ce2-48aa-b9c3-c59f0d86725d",
                  "type": FieldMetadataType.Position,
                  "name": "position",
                  "label": "Position",
                  "description": "View position",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
          "id": "87ef9245-2665-45db-8193-b6d216b5df50",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "5968ba3f-bc15-4989-ac5e-1b09a55a782a",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "00a542d7-4b97-4f56-b07d-cfd73dbc7239",
                  "type": FieldMetadataType.Relation,
                  "name": "workflow",
                  "label": "Workflow",
                  "description": "Workflow linked to the run.",
                  "icon": "IconSettingsAutomation",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "65095364-7e71-4813-aeea-c467435e0cb9",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "87ef9245-2665-45db-8193-b6d216b5df50",
                      "nameSingular": "workflowRun",
                      "namePlural": "workflowRuns"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "00a542d7-4b97-4f56-b07d-cfd73dbc7239",
                      "name": "workflow"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "8ee31473-4b30-4870-bcaa-92d77ad56bb6",
                      "nameSingular": "workflow",
                      "namePlural": "workflows"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "cd34b70c-4736-4ac3-b95d-0139d4f4f1bc",
                      "name": "runs"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "91543737-f39a-4b14-b0ac-62b071bb8303",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "28876be2-7039-438d-937b-2c0026413ee8",
                  "type": FieldMetadataType.Relation,
                  "name": "workflowVersion",
                  "label": "Workflow version",
                  "description": "Workflow version linked to the run.",
                  "icon": "IconVersions",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "6ab227db-4062-4786-a249-05df1ba98190",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "87ef9245-2665-45db-8193-b6d216b5df50",
                      "nameSingular": "workflowRun",
                      "namePlural": "workflowRuns"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "28876be2-7039-438d-937b-2c0026413ee8",
                      "name": "workflowVersion"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "fad28eb7-a085-4917-93b3-579afd54f373",
                      "nameSingular": "workflowVersion",
                      "namePlural": "workflowVersions"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "aa6e1d88-b8a9-4ffa-b7db-22cc28f1173b",
                      "name": "runs"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "5968ba3f-bc15-4989-ac5e-1b09a55a782a",
                  "type": FieldMetadataType.Text,
                  "name": "name",
                  "label": "Name",
                  "description": "Name of the workflow run",
                  "icon": "IconSettingsAutomation",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "0d947860-e6dd-4348-bc1e-407afd99cc63",
                  "type": FieldMetadataType.Actor,
                  "name": "createdBy",
                  "label": "Created by",
                  "description": "The creator of the record",
                  "icon": "IconCreativeCommonsSa",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "f6c5125e-bd93-48cb-b829-cea2ee169288",
                  "type": FieldMetadataType.Relation,
                  "name": "favorites",
                  "label": "Favorites",
                  "description": "Favorites linked to the workflow run",
                  "icon": "IconHeart",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "8041189b-a0b0-4d4b-9fae-de4f3a11bbb5",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "87ef9245-2665-45db-8193-b6d216b5df50",
                      "nameSingular": "workflowRun",
                      "namePlural": "workflowRuns"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "f6c5125e-bd93-48cb-b829-cea2ee169288",
                      "name": "favorites"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "6d72fd09-755d-409b-8455-f74da70fa9c1",
                      "nameSingular": "favorite",
                      "namePlural": "favorites"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "41dbf601-799d-4b39-9a55-e8bf3b443e55",
                      "name": "workflowRun"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "12e47ef0-3707-4884-881d-978abc609fc5",
                  "type": FieldMetadataType.RawJson,
                  "name": "output",
                  "label": "Output",
                  "description": "Json object to provide output of the workflow run",
                  "icon": "IconText",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "48dc78b2-05ea-46f4-a8bd-65af647b1fcf",
                  "type": FieldMetadataType.DateTime,
                  "name": "startedAt",
                  "label": "Workflow run started at",
                  "description": "Workflow run started at",
                  "icon": "IconHistory",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "48028f3a-50ee-46ea-96c6-f28824445184",
                  "type": FieldMetadataType.Uuid,
                  "name": "workflowId",
                  "label": "Workflow id (foreign key)",
                  "description": "Workflow linked to the run. id foreign key",
                  "icon": "IconSettingsAutomation",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "47274092-c29c-4717-b7b0-2de1a1007beb",
                  "type": FieldMetadataType.Relation,
                  "name": "timelineActivities",
                  "label": "Timeline Activities",
                  "description": "Timeline activities linked to the run",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "c94de946-5251-4f3e-ac9e-02b3df402610",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "87ef9245-2665-45db-8193-b6d216b5df50",
                      "nameSingular": "workflowRun",
                      "namePlural": "workflowRuns"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "47274092-c29c-4717-b7b0-2de1a1007beb",
                      "name": "timelineActivities"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "082301c2-cd4d-4cdf-ab5a-98a71d493036",
                      "nameSingular": "timelineActivity",
                      "namePlural": "timelineActivities"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "b3a935ca-5797-4bfb-b783-cd7b7725e330",
                      "name": "workflowRun"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "e7b715f3-5150-4294-9187-f2bb97a3de2a",
                  "type": FieldMetadataType.Uuid,
                  "name": "workflowVersionId",
                  "label": "Workflow version id (foreign key)",
                  "description": "Workflow version linked to the run. id foreign key",
                  "icon": "IconVersions",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "9b6942b5-6049-4edb-b1be-29117a300ab3",
                  "type": FieldMetadataType.Position,
                  "name": "position",
                  "label": "Position",
                  "description": "Workflow run position",
                  "icon": "IconHierarchy2",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "60ff2322-5514-4dd1-989b-dd92522879c7",
                  "type": FieldMetadataType.DateTime,
                  "name": "endedAt",
                  "label": "Workflow run ended at",
                  "description": "Workflow run ended at",
                  "icon": "IconHistory",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "9c85be84-5bcb-48d1-b78b-7a8c3f577fdd",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "7b2c6214-9533-427c-a124-a7c24407762b",
                  "type": FieldMetadataType.Select,
                  "name": "status",
                  "label": "Workflow run status",
                  "description": "Workflow run status",
                  "icon": "IconStatusChange",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "'NOT_STARTED'",
                  "options": [
                    {
                      "id": "7f326a56-d18d-4676-82df-d9a0685677f4",
                      "color": "grey",
                      "label": "Not started",
                      "value": "NOT_STARTED",
                      "position": 0
                    },
                    {
                      "id": "a9a6a610-0217-43b0-ab1d-4e4706ada0bb",
                      "color": "yellow",
                      "label": "Running",
                      "value": "RUNNING",
                      "position": 1
                    },
                    {
                      "id": "9e5e045d-cb5e-4fdb-96c9-a46e0423f394",
                      "color": "green",
                      "label": "Completed",
                      "value": "COMPLETED",
                      "position": 2
                    },
                    {
                      "id": "91f8d0f6-bc4f-46a0-8f83-bd5d1f6a5bff",
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
                  "id": "a9a10542-a375-47e5-ba56-869a0df30094",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "6c11c172-6ae8-496b-9e8e-bfdf10f8b956",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "uuid",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "694d33cc-92a6-4486-a155-25992cfcef61",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_eee970874f46ff99eefc0015001",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "d237d3c7-857e-45b2-929f-e145516dbb42",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "91543737-f39a-4b14-b0ac-62b071bb8303"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "ccdda23a-fb6a-4fa5-b668-61dea8f50a8d",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "48028f3a-50ee-46ea-96c6-f28824445184"
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
                  "id": "23e612a7-31dd-49c8-8910-c9804240a3bf",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_faa5772594c4ce15b9305919f2f",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": []
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
          "id": "84c4f534-4798-47ab-b725-a122e966ae9e",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "d57fbeeb-77b5-4797-ba59-8dff7b535578",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "60309d2d-c7d6-4ea5-9dc6-b48609cd8b7f",
                  "type": FieldMetadataType.Relation,
                  "name": "task",
                  "label": "Task",
                  "description": "TaskTarget task",
                  "icon": "IconCheckbox",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "0e8029bc-671b-4842-9911-81942fe6220f",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "84c4f534-4798-47ab-b725-a122e966ae9e",
                      "nameSingular": "taskTarget",
                      "namePlural": "taskTargets"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "60309d2d-c7d6-4ea5-9dc6-b48609cd8b7f",
                      "name": "task"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "25e10253-f0e1-4a6d-90e3-ad62a4b20292",
                      "nameSingular": "task",
                      "namePlural": "tasks"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "550afb9c-6f7e-444b-b4fa-2b6a4ae15843",
                      "name": "taskTargets"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "d64849ec-9efb-4502-93de-8370ee7b4065",
                  "type": FieldMetadataType.Uuid,
                  "name": "companyId",
                  "label": "Company id (foreign key)",
                  "description": "TaskTarget company id foreign key",
                  "icon": "IconBuildingSkyscraper",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "f4ba4abd-ade1-45a3-a994-618bbd36ab56",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "f309c2d8-9f5b-4b98-b5e0-f8cd9119cad5",
                  "type": FieldMetadataType.Relation,
                  "name": "rocket",
                  "label": "Rocket",
                  "description": "TaskTarget Rocket",
                  "icon": "IconBuildingSkyscraper",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:31.244Z",
                  "updatedAt": "2024-10-30T13:39:31.244Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "1b99cd19-7266-4b95-bbab-18e3c21fa86e",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "84c4f534-4798-47ab-b725-a122e966ae9e",
                      "nameSingular": "taskTarget",
                      "namePlural": "taskTargets"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "f309c2d8-9f5b-4b98-b5e0-f8cd9119cad5",
                      "name": "rocket"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "413848a7-bd94-4c24-aadc-0a5afe7a781f",
                      "nameSingular": "rocket",
                      "namePlural": "rockets"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "b2dd8997-fbde-4f55-8a3b-c3f1b8dd9328",
                      "name": "taskTargets"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "696fec5c-6c43-49c9-b293-a1695f76c646",
                  "type": FieldMetadataType.Uuid,
                  "name": "rocketId",
                  "label": "Rocket ID (foreign key)",
                  "description": "Task Target Rocket id foreign key",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:31.126Z",
                  "updatedAt": "2024-10-30T13:39:31.126Z",
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
                  "id": "b0dcd662-f5ae-47c5-8e27-e6f1fc6e054a",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "e4767ffd-9579-4e71-a21e-27bff7b9d095",
                  "type": FieldMetadataType.Uuid,
                  "name": "opportunityId",
                  "label": "Opportunity id (foreign key)",
                  "description": "TaskTarget opportunity id foreign key",
                  "icon": "IconTargetArrow",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "bb9069a3-d70d-4298-a0d1-0a65fd25fa39",
                  "type": FieldMetadataType.Uuid,
                  "name": "taskId",
                  "label": "Task id (foreign key)",
                  "description": "TaskTarget task id foreign key",
                  "icon": "IconCheckbox",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "d57fbeeb-77b5-4797-ba59-8dff7b535578",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "b91ea220-8c90-4035-8b78-0d8fd29e73b7",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "a52d3978-f82a-4aa9-ae01-72e969eb2423",
                  "type": FieldMetadataType.Relation,
                  "name": "company",
                  "label": "Company",
                  "description": "TaskTarget company",
                  "icon": "IconBuildingSkyscraper",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "30fd536e-8ba7-43a1-93f9-b9c68a88f3ac",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "84c4f534-4798-47ab-b725-a122e966ae9e",
                      "nameSingular": "taskTarget",
                      "namePlural": "taskTargets"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "a52d3978-f82a-4aa9-ae01-72e969eb2423",
                      "name": "company"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "af4e5bad-fa25-46ab-b32e-1147b5210107",
                      "nameSingular": "company",
                      "namePlural": "companies"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "8447e8fa-bb6c-4a20-9b65-1e833227a0b5",
                      "name": "taskTargets"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "b2bbd05f-98d5-49bd-a690-61469162f76c",
                  "type": FieldMetadataType.Relation,
                  "name": "person",
                  "label": "Person",
                  "description": "TaskTarget person",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "e2479abf-7807-4ac0-b640-581e95bef640",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "84c4f534-4798-47ab-b725-a122e966ae9e",
                      "nameSingular": "taskTarget",
                      "namePlural": "taskTargets"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "b2bbd05f-98d5-49bd-a690-61469162f76c",
                      "name": "person"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "1c05dac8-29f7-4f1e-9f61-579ad0eb647d",
                      "nameSingular": "person",
                      "namePlural": "people"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "2ae260b8-4aae-4f5e-8d2d-a073d280c837",
                      "name": "taskTargets"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "62113668-83c0-4b0d-93de-b3380a4378c0",
                  "type": FieldMetadataType.Relation,
                  "name": "opportunity",
                  "label": "Opportunity",
                  "description": "TaskTarget opportunity",
                  "icon": "IconTargetArrow",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "e1ee47a2-c138-4d9d-95da-46e3c7ee0816",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "84c4f534-4798-47ab-b725-a122e966ae9e",
                      "nameSingular": "taskTarget",
                      "namePlural": "taskTargets"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "62113668-83c0-4b0d-93de-b3380a4378c0",
                      "name": "opportunity"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "e85877ca-dc73-4b9e-b9b7-139dc06ca7b7",
                      "nameSingular": "opportunity",
                      "namePlural": "opportunities"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "0a687cbd-7462-41ec-a23b-d6430de48cf0",
                      "name": "taskTargets"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "1914b19c-eeee-4e3d-8231-a316aa64fe2f",
                  "type": FieldMetadataType.Uuid,
                  "name": "personId",
                  "label": "Person id (foreign key)",
                  "description": "TaskTarget person id foreign key",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "f5811523-199b-4ad1-b9a2-2509e9ead585",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_627d4437c96f22d5d46cc9a85bb",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "b2322b8c-49d9-4b20-8114-177ba9762842",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "bb9069a3-d70d-4298-a0d1-0a65fd25fa39"
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
                  "id": "0f326fc9-f9de-469f-b937-2c60e1ecfc89",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_b0ba7efcd8c529922bf6e858bc1",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "b67ecd1e-4044-4ab1-9291-daba9e16888b",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "e4767ffd-9579-4e71-a21e-27bff7b9d095"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "b722d997-cf66-44c3-8b30-49e3cc5793d0",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "f4ba4abd-ade1-45a3-a994-618bbd36ab56"
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
                  "id": "a60c8919-39f6-462a-b19e-36fb431653e7",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_cf12e6c92058f11b59852ffdfe3",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "e714dfb1-c879-46f4-be6a-fff94f8d7ff1",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "1914b19c-eeee-4e3d-8231-a316aa64fe2f"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "dc343653-a312-4786-8bf2-d7d9f23542a9",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "f4ba4abd-ade1-45a3-a994-618bbd36ab56"
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
                  "id": "3f882dba-c38f-4733-8f30-ab08319b9419",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_4e929e3af362914c41035c4d438",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "8e05eb7f-c0b5-462f-9773-46d5cb5ba13e",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "f4ba4abd-ade1-45a3-a994-618bbd36ab56"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "337b825c-3691-489f-b48c-1087df4818a1",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "d64849ec-9efb-4502-93de-8370ee7b4065"
                        }
                      }
                    ]
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
          "id": "7adf354a-c57f-4c76-8079-259f237dc5da",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "a2e3399b-b6da-4f39-be8c-665988d00e17",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": "N",
          "isLabelSyncedWithName": false,
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
                  "id": "088e248b-1ea4-4b8b-b8d3-163b8f956aed",
                  "type": FieldMetadataType.TsVector,
                  "name": "searchVector",
                  "label": "Search vector",
                  "description": "Field used for full-text search",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "288555f7-1803-4e5b-ac9b-3abdfb6f3340",
                  "type": FieldMetadataType.RichText,
                  "name": "body",
                  "label": "Body",
                  "description": "Note body",
                  "icon": "IconFilePencil",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "e307a2a6-4d9f-46e6-9bfe-808263d2f6b5",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "a2e3399b-b6da-4f39-be8c-665988d00e17",
                  "type": FieldMetadataType.Text,
                  "name": "title",
                  "label": "Title",
                  "description": "Note title",
                  "icon": "IconNotes",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "fa51d8f4-4a2e-4709-9e3c-ecb3b2602c18",
                  "type": FieldMetadataType.Relation,
                  "name": "timelineActivities",
                  "label": "Timeline Activities",
                  "description": "Timeline Activities linked to the note.",
                  "icon": "IconTimelineEvent",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "45d55e26-edac-4743-b536-8ae8d5af12cb",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "7adf354a-c57f-4c76-8079-259f237dc5da",
                      "nameSingular": "note",
                      "namePlural": "notes"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "fa51d8f4-4a2e-4709-9e3c-ecb3b2602c18",
                      "name": "timelineActivities"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "082301c2-cd4d-4cdf-ab5a-98a71d493036",
                      "nameSingular": "timelineActivity",
                      "namePlural": "timelineActivities"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "da52ab08-cd76-47d3-b333-c25755c023af",
                      "name": "note"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "c914780d-f29c-4ea9-9649-d5f30f86f485",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "b43ec724-faba-496a-a08c-6f8b379679ac",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "4cd92368-1e4f-46b2-b7c0-2ee9aba1d158",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "6bd180be-5c43-4b65-9fa1-255b236ec49e",
                  "type": FieldMetadataType.Relation,
                  "name": "noteTargets",
                  "label": "Relations",
                  "description": "Note targets",
                  "icon": "IconArrowUpRight",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "8b541da0-5092-4089-9f1f-9504e680c396",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "7adf354a-c57f-4c76-8079-259f237dc5da",
                      "nameSingular": "note",
                      "namePlural": "notes"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "6bd180be-5c43-4b65-9fa1-255b236ec49e",
                      "name": "noteTargets"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "01d676a5-d7e9-4d21-98a4-fbaccfa7ffdf",
                      "nameSingular": "noteTarget",
                      "namePlural": "noteTargets"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "04e4ad6b-cdaf-405d-98b1-2acb0a454c44",
                      "name": "note"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "93a20d82-a785-46fa-ac25-1bf79abcfb36",
                  "type": FieldMetadataType.Relation,
                  "name": "favorites",
                  "label": "Favorites",
                  "description": "Favorites linked to the note",
                  "icon": "IconHeart",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "40fb8870-92e3-423d-83cb-a7f5f50467c7",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "7adf354a-c57f-4c76-8079-259f237dc5da",
                      "nameSingular": "note",
                      "namePlural": "notes"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "93a20d82-a785-46fa-ac25-1bf79abcfb36",
                      "name": "favorites"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "6d72fd09-755d-409b-8455-f74da70fa9c1",
                      "nameSingular": "favorite",
                      "namePlural": "favorites"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "90c67348-a861-4d71-99a3-d133aaad7beb",
                      "name": "note"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "74b70e6b-31e7-41e3-9f17-86d8c0f5d305",
                  "type": FieldMetadataType.Actor,
                  "name": "createdBy",
                  "label": "Created by",
                  "description": "The creator of the record",
                  "icon": "IconCreativeCommonsSa",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "f918c029-41b2-415c-8c62-546ad560e899",
                  "type": FieldMetadataType.Position,
                  "name": "position",
                  "label": "Position",
                  "description": "Note record position",
                  "icon": "IconHierarchy2",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "2e691afe-cf6b-4d3a-9197-fd524c26eed7",
                  "type": FieldMetadataType.Relation,
                  "name": "attachments",
                  "label": "Attachments",
                  "description": "Note attachments",
                  "icon": "IconFileImport",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "54b587f6-d064-4d26-ad76-bb25c02467ba",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "7adf354a-c57f-4c76-8079-259f237dc5da",
                      "nameSingular": "note",
                      "namePlural": "notes"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "2e691afe-cf6b-4d3a-9197-fd524c26eed7",
                      "name": "attachments"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "ba95cbd9-694f-4ae5-906d-1f7cd213c9fe",
                      "nameSingular": "attachment",
                      "namePlural": "attachments"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "42e91677-2ca8-47ca-bce9-0f89369fe20e",
                      "name": "note"
                    }
                  }
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "d861da41-05c4-4349-a6ab-02e14abfc49a",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_f20de8d7fc74a405e4083051275",
                  "indexWhereClause": null,
                  "indexType": IndexType.Gin,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "973adde9-feaa-476a-9193-d1d6a9dd039c",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "088e248b-1ea4-4b8b-b8d3-163b8f956aed"
                        }
                      }
                    ]
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
          "id": "6d72fd09-755d-409b-8455-f74da70fa9c1",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "ac8fd20a-1eb2-4fe1-9d49-7967233c4cfd",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "25069fed-0167-4301-bab5-48d686bb78ac",
                  "type": FieldMetadataType.Relation,
                  "name": "workspaceMember",
                  "label": "Workspace Member",
                  "description": "Favorite workspace member",
                  "icon": "IconCircleUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "99e09c7d-bc02-4b11-b602-93e36a1f2b96",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "6d72fd09-755d-409b-8455-f74da70fa9c1",
                      "nameSingular": "favorite",
                      "namePlural": "favorites"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "25069fed-0167-4301-bab5-48d686bb78ac",
                      "name": "workspaceMember"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "a6ae81d6-b50b-4183-a2bb-ebcc0428dd53",
                      "nameSingular": "workspaceMember",
                      "namePlural": "workspaceMembers"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "08caaae1-0bd7-411c-9af1-72d4169976f0",
                      "name": "favorites"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "5a05ef2e-0ff8-4c3b-9eb7-2ba445f1ac2d",
                  "type": FieldMetadataType.Uuid,
                  "name": "workflowVersionId",
                  "label": "Workflow id (foreign key)",
                  "description": "Favorite workflow version id foreign key",
                  "icon": "IconSettingsAutomation",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "5675af11-2f87-403e-ac8f-dc2cc13d42bf",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "f9355fc1-f4a5-41ec-a2ec-92d50d4eccae",
                  "type": FieldMetadataType.Relation,
                  "name": "workflow",
                  "label": "Workflow",
                  "description": "Favorite workflow",
                  "icon": "IconSettingsAutomation",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "34fba28a-888e-496e-b7d1-f621479c4647",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "6d72fd09-755d-409b-8455-f74da70fa9c1",
                      "nameSingular": "favorite",
                      "namePlural": "favorites"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "f9355fc1-f4a5-41ec-a2ec-92d50d4eccae",
                      "name": "workflow"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "8ee31473-4b30-4870-bcaa-92d77ad56bb6",
                      "nameSingular": "workflow",
                      "namePlural": "workflows"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "e5cd9745-d76a-4ebd-b1dd-d10bb55fbb3d",
                      "name": "favorites"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "91ba686e-855e-46b8-b267-1a3cad4d621d",
                  "type": FieldMetadataType.Uuid,
                  "name": "personId",
                  "label": "Person id (foreign key)",
                  "description": "Favorite person id foreign key",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "e098e150-0b79-4da3-ad71-7fe3dce3d102",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "90c67348-a861-4d71-99a3-d133aaad7beb",
                  "type": FieldMetadataType.Relation,
                  "name": "note",
                  "label": "Note",
                  "description": "Favorite note",
                  "icon": "IconNotes",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "40fb8870-92e3-423d-83cb-a7f5f50467c7",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "6d72fd09-755d-409b-8455-f74da70fa9c1",
                      "nameSingular": "favorite",
                      "namePlural": "favorites"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "90c67348-a861-4d71-99a3-d133aaad7beb",
                      "name": "note"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "7adf354a-c57f-4c76-8079-259f237dc5da",
                      "nameSingular": "note",
                      "namePlural": "notes"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "93a20d82-a785-46fa-ac25-1bf79abcfb36",
                      "name": "favorites"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "b68bbe14-c5a7-4012-9edc-54d1cfb31e02",
                  "type": FieldMetadataType.Uuid,
                  "name": "noteId",
                  "label": "Note id (foreign key)",
                  "description": "Favorite note id foreign key",
                  "icon": "IconNotes",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "41dbf601-799d-4b39-9a55-e8bf3b443e55",
                  "type": FieldMetadataType.Relation,
                  "name": "workflowRun",
                  "label": "Workflow",
                  "description": "Favorite workflow run",
                  "icon": "IconSettingsAutomation",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "8041189b-a0b0-4d4b-9fae-de4f3a11bbb5",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "6d72fd09-755d-409b-8455-f74da70fa9c1",
                      "nameSingular": "favorite",
                      "namePlural": "favorites"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "41dbf601-799d-4b39-9a55-e8bf3b443e55",
                      "name": "workflowRun"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "87ef9245-2665-45db-8193-b6d216b5df50",
                      "nameSingular": "workflowRun",
                      "namePlural": "workflowRuns"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "f6c5125e-bd93-48cb-b829-cea2ee169288",
                      "name": "favorites"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "2c5cecbb-1e99-478d-bd77-f3f2ee66efda",
                  "type": FieldMetadataType.Relation,
                  "name": "task",
                  "label": "Task",
                  "description": "Favorite task",
                  "icon": "IconCheckbox",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "2668313f-71ee-4c11-8098-7ffeae4ac8d0",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "6d72fd09-755d-409b-8455-f74da70fa9c1",
                      "nameSingular": "favorite",
                      "namePlural": "favorites"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "2c5cecbb-1e99-478d-bd77-f3f2ee66efda",
                      "name": "task"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "25e10253-f0e1-4a6d-90e3-ad62a4b20292",
                      "nameSingular": "task",
                      "namePlural": "tasks"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "b86ee0bd-5e4d-4d91-8d2a-1473d155dc42",
                      "name": "favorites"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "5dc0d81e-4ca9-4778-afa3-0b2fe45ea731",
                  "type": FieldMetadataType.Uuid,
                  "name": "rocketId",
                  "label": "Rocket ID (foreign key)",
                  "description": "Favorite Rocket id foreign key",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:30.544Z",
                  "updatedAt": "2024-10-30T13:39:30.544Z",
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
                  "id": "92978ffb-3eaf-4dc7-8ef2-0b552c3d6e49",
                  "type": FieldMetadataType.Relation,
                  "name": "rocket",
                  "label": "Rocket",
                  "description": "Favorite Rocket",
                  "icon": "IconBuildingSkyscraper",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:30.731Z",
                  "updatedAt": "2024-10-30T13:39:30.731Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "9cc4dba5-2509-432f-9b70-0f68e768b5de",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "6d72fd09-755d-409b-8455-f74da70fa9c1",
                      "nameSingular": "favorite",
                      "namePlural": "favorites"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "92978ffb-3eaf-4dc7-8ef2-0b552c3d6e49",
                      "name": "rocket"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "413848a7-bd94-4c24-aadc-0a5afe7a781f",
                      "nameSingular": "rocket",
                      "namePlural": "rockets"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "38a3c7ea-b4e9-4f01-8e37-db83fa192f8d",
                      "name": "favorites"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "c45048d1-3585-46fc-a308-425e6422ab24",
                  "type": FieldMetadataType.Number,
                  "name": "position",
                  "label": "Position",
                  "description": "Favorite position",
                  "icon": "IconList",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "e1c22c51-fdf3-4c9f-bcce-e4e4c0ebc915",
                  "type": FieldMetadataType.Relation,
                  "name": "opportunity",
                  "label": "Opportunity",
                  "description": "Favorite opportunity",
                  "icon": "IconTargetArrow",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "0cc12e6a-f7f5-40e5-a686-0eba9c8ed934",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "6d72fd09-755d-409b-8455-f74da70fa9c1",
                      "nameSingular": "favorite",
                      "namePlural": "favorites"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "e1c22c51-fdf3-4c9f-bcce-e4e4c0ebc915",
                      "name": "opportunity"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "e85877ca-dc73-4b9e-b9b7-139dc06ca7b7",
                      "nameSingular": "opportunity",
                      "namePlural": "opportunities"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "57b74932-1aa3-4372-9962-138ff1493eeb",
                      "name": "favorites"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "9e16d413-65a0-4f26-a596-cdcc9a5219f1",
                  "type": FieldMetadataType.Uuid,
                  "name": "workflowRunId",
                  "label": "Workflow id (foreign key)",
                  "description": "Favorite workflow run id foreign key",
                  "icon": "IconSettingsAutomation",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "0b529980-643b-44f1-a007-328cf99be91a",
                  "type": FieldMetadataType.Relation,
                  "name": "view",
                  "label": "View",
                  "description": "Favorite view",
                  "icon": "IconLayoutCollage",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "bfdbdf10-236c-4048-9965-8a0e16e5fe22",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "6d72fd09-755d-409b-8455-f74da70fa9c1",
                      "nameSingular": "favorite",
                      "namePlural": "favorites"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "0b529980-643b-44f1-a007-328cf99be91a",
                      "name": "view"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "88520ce4-938b-4d9f-a5ea-61e5e89f767e",
                      "nameSingular": "view",
                      "namePlural": "views"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "d7a5d3aa-3975-45ec-8c9b-f7149289a849",
                      "name": "favorites"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "4c310c26-7123-417d-a0cf-97c92e6cb217",
                  "type": FieldMetadataType.Uuid,
                  "name": "viewId",
                  "label": "View id (foreign key)",
                  "description": "Favorite view id foreign key",
                  "icon": "IconLayoutCollage",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "efe57404-33f2-4fc6-9966-4eb401268efb",
                  "type": FieldMetadataType.Relation,
                  "name": "workflowVersion",
                  "label": "Workflow",
                  "description": "Favorite workflow version",
                  "icon": "IconSettingsAutomation",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "2871058e-3264-4ab3-8b57-2f35cd39c676",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "6d72fd09-755d-409b-8455-f74da70fa9c1",
                      "nameSingular": "favorite",
                      "namePlural": "favorites"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "efe57404-33f2-4fc6-9966-4eb401268efb",
                      "name": "workflowVersion"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "fad28eb7-a085-4917-93b3-579afd54f373",
                      "nameSingular": "workflowVersion",
                      "namePlural": "workflowVersions"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "e7f40f5e-c67a-488b-aa6b-52769a752df7",
                      "name": "favorites"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "be0596a5-7a14-4c1d-b065-40e63feefb46",
                  "type": FieldMetadataType.Uuid,
                  "name": "workflowId",
                  "label": "Workflow id (foreign key)",
                  "description": "Favorite workflow id foreign key",
                  "icon": "IconSettingsAutomation",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "116304eb-76ab-41f2-b117-e57f278425a4",
                  "type": FieldMetadataType.Uuid,
                  "name": "companyId",
                  "label": "Company id (foreign key)",
                  "description": "Favorite company id foreign key",
                  "icon": "IconBuildingSkyscraper",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "19748dd4-4c79-4d32-ade4-1937d7c6a05f",
                  "type": FieldMetadataType.Relation,
                  "name": "company",
                  "label": "Company",
                  "description": "Favorite company",
                  "icon": "IconBuildingSkyscraper",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "825c3208-3eb6-47e6-bc5f-6e8b12d56923",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "6d72fd09-755d-409b-8455-f74da70fa9c1",
                      "nameSingular": "favorite",
                      "namePlural": "favorites"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "19748dd4-4c79-4d32-ade4-1937d7c6a05f",
                      "name": "company"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "af4e5bad-fa25-46ab-b32e-1147b5210107",
                      "nameSingular": "company",
                      "namePlural": "companies"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "22f3c2c1-124f-4304-861c-4aad29a00bd4",
                      "name": "favorites"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "ac8fd20a-1eb2-4fe1-9d49-7967233c4cfd",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "d8e8bb7a-e785-4b4e-8bae-b3ec3a87c52d",
                  "type": FieldMetadataType.Uuid,
                  "name": "workspaceMemberId",
                  "label": "Workspace Member id (foreign key)",
                  "description": "Favorite workspace member id foreign key",
                  "icon": "IconCircleUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "bd0b3981-63dd-4a8d-95cf-71080dae3364",
                  "type": FieldMetadataType.Relation,
                  "name": "person",
                  "label": "Person",
                  "description": "Favorite person",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "6e7d8470-4f3e-415d-843c-306380a483f0",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "6d72fd09-755d-409b-8455-f74da70fa9c1",
                      "nameSingular": "favorite",
                      "namePlural": "favorites"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "bd0b3981-63dd-4a8d-95cf-71080dae3364",
                      "name": "person"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "1c05dac8-29f7-4f1e-9f61-579ad0eb647d",
                      "nameSingular": "person",
                      "namePlural": "people"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "6586555e-28ad-4b8a-855b-f8cbbd327c13",
                      "name": "favorites"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "16e48757-44ba-42a2-84e6-f5e5be5a2ee3",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "a883215a-10dc-4263-8872-253538521e2a",
                  "type": FieldMetadataType.Uuid,
                  "name": "taskId",
                  "label": "Task id (foreign key)",
                  "description": "Favorite task id foreign key",
                  "icon": "IconCheckbox",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "82cb7819-24d8-4630-b76e-d496bfa6f768",
                  "type": FieldMetadataType.Uuid,
                  "name": "opportunityId",
                  "label": "Opportunity id (foreign key)",
                  "description": "Favorite opportunity id foreign key",
                  "icon": "IconTargetArrow",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "b9c0c8f3-f978-43a4-b4e5-d17210678390",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_1f7e4cb168e77496349c8cefed6",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "a6b03189-127c-494e-aa10-bc4e0fa80c4b",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "91ba686e-855e-46b8-b267-1a3cad4d621d"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "39c7c1d1-b44b-4071-9584-63e10cb8916b",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "16e48757-44ba-42a2-84e6-f5e5be5a2ee3"
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
                  "id": "8eea0c69-5617-41b1-abb3-c01ca0f3e173",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_eecddc968e93b9b8ebbfd85dad3",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "62294df7-e349-41d7-9cd5-47fcfd3646d0",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "be0596a5-7a14-4c1d-b065-40e63feefb46"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "ed5ea57f-4de5-4754-ae3c-b906ca5e8366",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "16e48757-44ba-42a2-84e6-f5e5be5a2ee3"
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
                  "id": "671f45a3-45ac-4be8-be9f-d0e823e4b790",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_505a1fccd2804f2472bd92e8720",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "283bee73-e037-486f-8f06-12cd7dd85912",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "4c310c26-7123-417d-a0cf-97c92e6cb217"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "33e7d307-f410-43d0-b7f0-5bf2296f209f",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "16e48757-44ba-42a2-84e6-f5e5be5a2ee3"
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
                  "id": "2b5fbac8-5dd1-46a7-91c3-1c447c74fbd9",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_e14b3424016bea8b7fe220f7761",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "d8147472-6eb6-4b28-85c3-7222e5fb659e",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "a883215a-10dc-4263-8872-253538521e2a"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "dc1d9d97-1b28-4057-a84a-a398de93ee18",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "16e48757-44ba-42a2-84e6-f5e5be5a2ee3"
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
                  "id": "92638456-9286-4fb3-b2e4-d2c1d0971113",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_110d1dc7f0ecd231a18f6784cf3",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "3cb26ed4-777c-415d-90d0-e0ed7feffef8",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "5a05ef2e-0ff8-4c3b-9eb7-2ba445f1ac2d"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "dcbf220f-1a30-43bb-8e38-a22cb06c3553",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "16e48757-44ba-42a2-84e6-f5e5be5a2ee3"
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
                  "id": "4ca01c97-27e5-41e3-b831-8a1f9f581407",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_c3ee83d51bc99ba99fe1998c508",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "9aec2813-e2db-4b3e-baaf-87fd60742907",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "16e48757-44ba-42a2-84e6-f5e5be5a2ee3"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "0e46f616-4fbb-4a63-8bb8-4c09d098a105",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "d8e8bb7a-e785-4b4e-8bae-b3ec3a87c52d"
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
                  "id": "36407d13-1f89-4edf-8f8c-0d0b902b7ee7",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_21d905e0adf19e835f6059a9f3d",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "4c6ea08a-f692-45e1-a380-9ba3678008b8",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "b68bbe14-c5a7-4012-9edc-54d1cfb31e02"
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
                  "id": "005f34c5-fe40-4115-8192-2e2e87f300af",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_85f024f9ec673d530d14cf75fe5",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "572c2dec-f881-4732-9e2b-38d490532e2a",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "16e48757-44ba-42a2-84e6-f5e5be5a2ee3"
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
                  "id": "62594f8c-c032-4b66-b2a1-ef12dc6ebb4f",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_7c59b29a053016fc596ddad8a0e",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
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
                  "id": "081fb1ef-7540-4f8d-948a-71c97322cb96",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_a900d9f809273abe54dc5e166fa",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "8bac748e-692c-42eb-8c9f-2cd7b7682006",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "116304eb-76ab-41f2-b117-e57f278425a4"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "e31213f3-2d64-4585-ade5-a6b07224618f",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "16e48757-44ba-42a2-84e6-f5e5be5a2ee3"
                        }
                      }
                    ]
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
          "id": "68534b8b-9599-4e4b-9fb8-8a3c56adb871",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "42967cd6-fee2-485e-8c29-dcbd2502ac11",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "42967cd6-fee2-485e-8c29-dcbd2502ac11",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "3290f5bf-c86e-4bd7-8195-579faeebe447",
                  "type": FieldMetadataType.Boolean,
                  "name": "isVisible",
                  "label": "Visible",
                  "description": "View Field visibility",
                  "icon": "IconEye",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "5fc8348f-d629-4811-b5c6-df04d477a0b1",
                  "type": FieldMetadataType.Number,
                  "name": "position",
                  "label": "Position",
                  "description": "View Field position",
                  "icon": "IconList",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "46afae67-47b1-4580-8145-fc7914e8a61d",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "3dfe31ef-710f-4ee6-8140-739540b59981",
                  "type": FieldMetadataType.Uuid,
                  "name": "fieldMetadataId",
                  "label": "Field Metadata Id",
                  "description": "View Field target field",
                  "icon": "IconTag",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "3c352886-5e5b-487f-af51-c305f282fd8e",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "f5c138b1-3d89-42c5-9838-793a925d5b5c",
                  "type": FieldMetadataType.Uuid,
                  "name": "viewId",
                  "label": "View id (foreign key)",
                  "description": "View Field related view id foreign key",
                  "icon": "IconLayoutCollage",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "9becab25-df5b-49f3-a58a-8ccd8a4382aa",
                  "type": FieldMetadataType.Number,
                  "name": "size",
                  "label": "Size",
                  "description": "View Field size",
                  "icon": "IconEye",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "968d63ae-a05f-4fa2-ad3a-14fd8b6d62e8",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "f0bee61a-f5a0-4b60-af98-12f854be6127",
                  "type": FieldMetadataType.Relation,
                  "name": "view",
                  "label": "View",
                  "description": "View Field related view",
                  "icon": "IconLayoutCollage",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "e44f91d9-a6fc-440f-aa2b-b9b7d5446da6",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "68534b8b-9599-4e4b-9fb8-8a3c56adb871",
                      "nameSingular": "viewField",
                      "namePlural": "viewFields"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "f0bee61a-f5a0-4b60-af98-12f854be6127",
                      "name": "view"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "88520ce4-938b-4d9f-a5ea-61e5e89f767e",
                      "nameSingular": "view",
                      "namePlural": "views"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "24a2711c-7273-4abf-bbbb-71ef3b1d25d5",
                      "name": "viewFields"
                    }
                  }
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "3f01db7c-2848-44fd-9392-c1d3b9ba4989",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_260f80ae1d2ccc67388995d6d05",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "ac2f947e-8b68-4415-8675-4a7ca1018b00",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "f5c138b1-3d89-42c5-9838-793a925d5b5c"
                        }
                      }
                    ]
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
          "id": "5c1e17cb-3ed9-4024-b427-fe576d6ce3d1",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "1a0f0f90-39f0-4dfa-8c07-f0da10c45b77",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "644a6279-9b22-4875-911d-c4d6b19fc415",
                  "type": FieldMetadataType.Uuid,
                  "name": "accountOwnerId",
                  "label": "Account Owner id (foreign key)",
                  "description": "Account Owner id foreign key",
                  "icon": "IconUserCircle",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "1a0f0f90-39f0-4dfa-8c07-f0da10c45b77",
                  "type": FieldMetadataType.Text,
                  "name": "handle",
                  "label": "handle",
                  "description": "The account handle (email, username, phone number, etc.)",
                  "icon": "IconMail",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "0f6d6cb8-dec6-4361-bb44-1c3d628ca055",
                  "type": FieldMetadataType.Array,
                  "name": "scopes",
                  "label": "Scopes",
                  "description": "Scopes",
                  "icon": "IconSettings",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "e189a013-da4a-43ee-ae9d-3e7d87bd6750",
                  "type": FieldMetadataType.Relation,
                  "name": "messageChannels",
                  "label": "Message Channels",
                  "description": "Message Channels",
                  "icon": "IconMessage",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "80daf432-7306-4951-be4c-14e92bfc7d68",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "5c1e17cb-3ed9-4024-b427-fe576d6ce3d1",
                      "nameSingular": "connectedAccount",
                      "namePlural": "connectedAccounts"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "e189a013-da4a-43ee-ae9d-3e7d87bd6750",
                      "name": "messageChannels"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "41302fe4-df07-425f-a492-56d7e6c759af",
                      "nameSingular": "messageChannel",
                      "namePlural": "messageChannels"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "fd38bf5a-9daa-4db1-9aff-a644a9a31bfb",
                      "name": "connectedAccount"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "45e6ca5d-c892-4d5d-a658-6bfd946de892",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "d73f15df-0bec-47d7-aef0-38a750f96cd1",
                  "type": FieldMetadataType.Text,
                  "name": "accessToken",
                  "label": "Access Token",
                  "description": "Messaging provider access token",
                  "icon": "IconKey",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "03cc45bb-1dc9-4e32-a950-56b545d49e34",
                  "type": FieldMetadataType.Text,
                  "name": "lastSyncHistoryId",
                  "label": "Last sync history ID",
                  "description": "Last sync history ID",
                  "icon": "IconHistory",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "0f973833-7024-4f6a-a569-cf63e6e4ed3e",
                  "type": FieldMetadataType.DateTime,
                  "name": "authFailedAt",
                  "label": "Auth failed at",
                  "description": "Auth failed at",
                  "icon": "IconX",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "1413d79c-f260-4ee1-bd2a-8121ff7f3b92",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "876d7b6e-658f-486f-9fec-9753f1d46ea5",
                  "type": FieldMetadataType.Text,
                  "name": "handleAliases",
                  "label": "Handle Aliases",
                  "description": "Handle Aliases",
                  "icon": "IconMail",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "705cde2c-b970-41f4-804d-77f6e214ce00",
                  "type": FieldMetadataType.Text,
                  "name": "provider",
                  "label": "provider",
                  "description": "The account provider",
                  "icon": "IconSettings",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "12864caa-e6cc-450f-919d-a706fdb7b95f",
                  "type": FieldMetadataType.Relation,
                  "name": "accountOwner",
                  "label": "Account Owner",
                  "description": "Account Owner",
                  "icon": "IconUserCircle",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "1dd4ab3f-43a8-44a3-8676-3c6298a5428b",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "5c1e17cb-3ed9-4024-b427-fe576d6ce3d1",
                      "nameSingular": "connectedAccount",
                      "namePlural": "connectedAccounts"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "12864caa-e6cc-450f-919d-a706fdb7b95f",
                      "name": "accountOwner"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "a6ae81d6-b50b-4183-a2bb-ebcc0428dd53",
                      "nameSingular": "workspaceMember",
                      "namePlural": "workspaceMembers"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "b0a371af-199c-4d76-b16f-08cd67f33f13",
                      "name": "connectedAccounts"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "eda65f70-e1bf-443a-b3a0-98fc4db298d9",
                  "type": FieldMetadataType.Text,
                  "name": "refreshToken",
                  "label": "Refresh Token",
                  "description": "Messaging provider refresh token",
                  "icon": "IconKey",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "946967c6-050a-406a-8132-b46fc1b53a91",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "664c36e8-7d1f-4077-9f2c-3d65d0d219cf",
                  "type": FieldMetadataType.Relation,
                  "name": "calendarChannels",
                  "label": "Calendar Channels",
                  "description": "Calendar Channels",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "9d18dc97-6d4f-43ad-adc0-2293f25e969c",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "5c1e17cb-3ed9-4024-b427-fe576d6ce3d1",
                      "nameSingular": "connectedAccount",
                      "namePlural": "connectedAccounts"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "664c36e8-7d1f-4077-9f2c-3d65d0d219cf",
                      "name": "calendarChannels"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "024357b0-9d5b-4e68-b8e2-70acf57a9aba",
                      "nameSingular": "calendarChannel",
                      "namePlural": "calendarChannels"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "ca742a11-31e4-43aa-813d-04e83c50e4a5",
                      "name": "connectedAccount"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "107c829a-878a-4a40-be43-4ce5ab9e557f",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "28b2a6d7-107f-4b2a-8df4-04a613bc3b32",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_7d1b454b2a538273bdb947e848f",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "15967233-a800-401e-a290-b94814d08365",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "45e6ca5d-c892-4d5d-a658-6bfd946de892"
                        }
                      }
                    ]
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
          "id": "5706c0cc-9d33-4bb8-8b6d-db74b8d882c8",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "8258a232-1cfe-43db-82b0-dd999a10b439",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "345934cd-ebb1-4a71-888d-2e80407e4564",
                  "type": FieldMetadataType.Uuid,
                  "name": "workspaceMemberId",
                  "label": "Workspace Member id (foreign key)",
                  "description": "Workspace Member id foreign key",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "5c1f96ef-de40-4391-a0f7-eea1f915fd91",
                  "type": FieldMetadataType.Text,
                  "name": "displayName",
                  "label": "Display Name",
                  "description": "Display Name",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "dfd280bd-60f5-4291-bff3-ee40a512afd6",
                  "type": FieldMetadataType.Relation,
                  "name": "person",
                  "label": "Person",
                  "description": "Person",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "194734ec-9308-4711-b6ec-3ede45a44978",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "5706c0cc-9d33-4bb8-8b6d-db74b8d882c8",
                      "nameSingular": "calendarEventParticipant",
                      "namePlural": "calendarEventParticipants"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "dfd280bd-60f5-4291-bff3-ee40a512afd6",
                      "name": "person"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "1c05dac8-29f7-4f1e-9f61-579ad0eb647d",
                      "nameSingular": "person",
                      "namePlural": "people"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "ad176aea-890e-4e7c-b0e5-67d9b9717e02",
                      "name": "calendarEventParticipants"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "1c6f514b-4cf8-4081-8be8-89bce1287858",
                  "type": FieldMetadataType.Boolean,
                  "name": "isOrganizer",
                  "label": "Is Organizer",
                  "description": "Is Organizer",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "f1a8e944-fa6b-4d4b-9548-09d31116d663",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "6cfcc8ed-1a98-4669-a763-f1c8f1b04b78",
                  "type": FieldMetadataType.Relation,
                  "name": "workspaceMember",
                  "label": "Workspace Member",
                  "description": "Workspace Member",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "50ab4e40-3ac5-450d-92ed-5443e2854aa3",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "5706c0cc-9d33-4bb8-8b6d-db74b8d882c8",
                      "nameSingular": "calendarEventParticipant",
                      "namePlural": "calendarEventParticipants"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "6cfcc8ed-1a98-4669-a763-f1c8f1b04b78",
                      "name": "workspaceMember"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "a6ae81d6-b50b-4183-a2bb-ebcc0428dd53",
                      "nameSingular": "workspaceMember",
                      "namePlural": "workspaceMembers"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "2ac0f031-4d2a-4cb1-927f-3b32c9e03912",
                      "name": "calendarEventParticipants"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "96ab4763-eec6-4cde-bb84-3c86d1f3822f",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "1c9e5767-78f4-4305-b6dd-b4efcf25bdb8",
                  "type": FieldMetadataType.Uuid,
                  "name": "calendarEventId",
                  "label": "Event ID id (foreign key)",
                  "description": "Event ID id foreign key",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "26eb2191-4e7a-433b-8be4-d1f65b744a5a",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "051b041b-808e-4be6-b6ff-6a11a83d3017",
                  "type": FieldMetadataType.Uuid,
                  "name": "personId",
                  "label": "Person id (foreign key)",
                  "description": "Person id foreign key",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "a7dc3d33-0cfd-4e64-87bc-441a00993231",
                  "type": FieldMetadataType.Select,
                  "name": "responseStatus",
                  "label": "Response Status",
                  "description": "Response Status",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "'NEEDS_ACTION'",
                  "options": [
                    {
                      "id": "8544e916-a99e-4f34-97ed-20bea2ccfffd",
                      "color": "orange",
                      "label": "Needs Action",
                      "value": "NEEDS_ACTION",
                      "position": 0
                    },
                    {
                      "id": "c3adef56-ea8f-4486-93fc-386a2f3db815",
                      "color": "red",
                      "label": "Declined",
                      "value": "DECLINED",
                      "position": 1
                    },
                    {
                      "id": "eb2a3376-9ee9-4275-9325-c54d5b111d55",
                      "color": "yellow",
                      "label": "Tentative",
                      "value": "TENTATIVE",
                      "position": 2
                    },
                    {
                      "id": "628aa0e7-a574-4175-9491-7e81bb314ed4",
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
                  "id": "1cb56c41-518b-4c17-a171-03c078c5da81",
                  "type": FieldMetadataType.Relation,
                  "name": "calendarEvent",
                  "label": "Event ID",
                  "description": "Event ID",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "3d04a82d-f4eb-4c8d-b09f-e86409e0883b",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "5706c0cc-9d33-4bb8-8b6d-db74b8d882c8",
                      "nameSingular": "calendarEventParticipant",
                      "namePlural": "calendarEventParticipants"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "1cb56c41-518b-4c17-a171-03c078c5da81",
                      "name": "calendarEvent"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "e7a5e974-affc-40d5-be9f-2ba2783c21be",
                      "nameSingular": "calendarEvent",
                      "namePlural": "calendarEvents"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "09edc594-fdc7-44a4-8079-9560c804e85b",
                      "name": "calendarEventParticipants"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "d461f529-fabc-4a2b-a858-14d7898e79b8",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "8258a232-1cfe-43db-82b0-dd999a10b439",
                  "type": FieldMetadataType.Text,
                  "name": "handle",
                  "label": "Handle",
                  "description": "Handle",
                  "icon": "IconMail",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "01ca121e-057a-4e97-b3a8-951b374e7346",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_0da422bbe7adbabb8144c696ebd",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "6f746686-c6f1-435f-bd77-043c23ac15da",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "051b041b-808e-4be6-b6ff-6a11a83d3017"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "2ff40ad6-ae2c-4a28-8e18-08e8ab81fc97",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "26eb2191-4e7a-433b-8be4-d1f65b744a5a"
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
                  "id": "7a610b59-8756-4045-9373-68aeafc11474",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_dd22aee9059fd7002165df6d8cc",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "0360cace-32af-4b99-bb68-6942e6663044",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "1c9e5767-78f4-4305-b6dd-b4efcf25bdb8"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "cb6b62d3-18db-4655-93fc-4e4a3acc7d42",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "26eb2191-4e7a-433b-8be4-d1f65b744a5a"
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
                  "id": "b7b923e5-3c9d-464c-a6b1-cb55c535e6bd",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_2bf094726f6d91639302c1c143d",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "ac98e45b-c576-49d9-a900-b5cb5893ce3f",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "26eb2191-4e7a-433b-8be4-d1f65b744a5a"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "a23a899a-5ea0-46bb-870f-8122b8be4d76",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "345934cd-ebb1-4a71-888d-2e80407e4564"
                        }
                      }
                    ]
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
          "id": "413848a7-bd94-4c24-aadc-0a5afe7a781f",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:39:30.402Z",
          "updatedAt": "2024-10-30T13:39:30.402Z",
          "labelIdentifierFieldMetadataId": null,
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "d9188027-ccae-41e1-9838-fe3908189b25",
                  "type": FieldMetadataType.TsVector,
                  "name": "searchVector",
                  "label": "Search vector",
                  "description": "Field used for full-text search",
                  "icon": null,
                  "isCustom": false,
                  "isActive": false,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:31.423Z",
                  "updatedAt": "2024-10-30T13:39:31.423Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "beaac4a1-c635-42bb-b983-489dca948f1f",
                  "type": FieldMetadataType.Position,
                  "name": "position",
                  "label": "Position",
                  "description": "Position",
                  "icon": "IconHierarchy2",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:30.402Z",
                  "updatedAt": "2024-10-30T13:39:30.402Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "f7838a09-e44a-4f0c-99a1-44fa96648613",
                  "type": FieldMetadataType.Text,
                  "name": "name",
                  "label": "Name",
                  "description": "Name",
                  "icon": "IconAbc",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:30.402Z",
                  "updatedAt": "2024-10-30T13:39:30.402Z",
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
                  "id": "38a3c7ea-b4e9-4f01-8e37-db83fa192f8d",
                  "type": FieldMetadataType.Relation,
                  "name": "favorites",
                  "label": "Favorites",
                  "description": "Favorites tied to the Rocket",
                  "icon": "IconHeart",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:30.731Z",
                  "updatedAt": "2024-10-30T13:39:30.731Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "9cc4dba5-2509-432f-9b70-0f68e768b5de",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "413848a7-bd94-4c24-aadc-0a5afe7a781f",
                      "nameSingular": "rocket",
                      "namePlural": "rockets"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "38a3c7ea-b4e9-4f01-8e37-db83fa192f8d",
                      "name": "favorites"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "6d72fd09-755d-409b-8455-f74da70fa9c1",
                      "nameSingular": "favorite",
                      "namePlural": "favorites"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "92978ffb-3eaf-4dc7-8ef2-0b552c3d6e49",
                      "name": "rocket"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "d9123ccf-55e8-4af8-913e-7706db201cc8",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:30.402Z",
                  "updatedAt": "2024-10-30T13:39:30.402Z",
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
                  "id": "b2dd8997-fbde-4f55-8a3b-c3f1b8dd9328",
                  "type": FieldMetadataType.Relation,
                  "name": "taskTargets",
                  "label": "TaskTargets",
                  "description": "TaskTargets tied to the Rocket",
                  "icon": "IconCheckbox",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:31.244Z",
                  "updatedAt": "2024-10-30T13:39:31.244Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "1b99cd19-7266-4b95-bbab-18e3c21fa86e",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "413848a7-bd94-4c24-aadc-0a5afe7a781f",
                      "nameSingular": "rocket",
                      "namePlural": "rockets"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "b2dd8997-fbde-4f55-8a3b-c3f1b8dd9328",
                      "name": "taskTargets"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "84c4f534-4798-47ab-b725-a122e966ae9e",
                      "nameSingular": "taskTarget",
                      "namePlural": "taskTargets"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "f309c2d8-9f5b-4b98-b5e0-f8cd9119cad5",
                      "name": "rocket"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "0d2b7aeb-19a2-451f-9bd6-8a14036840d8",
                  "type": FieldMetadataType.Relation,
                  "name": "noteTargets",
                  "label": "NoteTargets",
                  "description": "NoteTargets tied to the Rocket",
                  "icon": "IconCheckbox",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:31.219Z",
                  "updatedAt": "2024-10-30T13:39:31.219Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "9a5f9b38-4951-45ee-b126-609794fb16fa",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "413848a7-bd94-4c24-aadc-0a5afe7a781f",
                      "nameSingular": "rocket",
                      "namePlural": "rockets"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "0d2b7aeb-19a2-451f-9bd6-8a14036840d8",
                      "name": "noteTargets"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "01d676a5-d7e9-4d21-98a4-fbaccfa7ffdf",
                      "nameSingular": "noteTarget",
                      "namePlural": "noteTargets"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "e0ad90c6-04c4-45d2-af8e-73da4c514279",
                      "name": "rocket"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "a588ccec-9e17-43bb-86f6-82c454f760fc",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:30.402Z",
                  "updatedAt": "2024-10-30T13:39:30.402Z",
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
                  "id": "4a3045e0-70ae-4ea5-8566-19847ab0d19c",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Deletion date",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:30.402Z",
                  "updatedAt": "2024-10-30T13:39:30.402Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "6e47f007-07b7-4158-8c17-412fb3685545",
                  "type": FieldMetadataType.Relation,
                  "name": "attachments",
                  "label": "Attachments",
                  "description": "Attachments tied to the Rocket",
                  "icon": "IconFileImport",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:30.780Z",
                  "updatedAt": "2024-10-30T13:39:30.780Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "bf3ebee1-7f7c-4f0a-923b-278b055708d9",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "413848a7-bd94-4c24-aadc-0a5afe7a781f",
                      "nameSingular": "rocket",
                      "namePlural": "rockets"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "6e47f007-07b7-4158-8c17-412fb3685545",
                      "name": "attachments"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "ba95cbd9-694f-4ae5-906d-1f7cd213c9fe",
                      "nameSingular": "attachment",
                      "namePlural": "attachments"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "b0c5d631-1242-4fbc-9570-501a17a65338",
                      "name": "rocket"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "6a01f496-cb3a-4216-81a7-a74a9a654e74",
                  "type": FieldMetadataType.Relation,
                  "name": "timelineActivities",
                  "label": "TimelineActivities",
                  "description": "TimelineActivities tied to the Rocket",
                  "icon": "IconTimelineEvent",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:30.641Z",
                  "updatedAt": "2024-10-30T13:39:30.641Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "c0322ad7-03e8-456c-85f5-a9f1726ca85a",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "413848a7-bd94-4c24-aadc-0a5afe7a781f",
                      "nameSingular": "rocket",
                      "namePlural": "rockets"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "6a01f496-cb3a-4216-81a7-a74a9a654e74",
                      "name": "timelineActivities"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "082301c2-cd4d-4cdf-ab5a-98a71d493036",
                      "nameSingular": "timelineActivity",
                      "namePlural": "timelineActivities"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "746f850a-4f72-41fc-b92b-eb3d1dba3c00",
                      "name": "rocket"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "2d761083-a788-4189-9667-cb46be416d58",
                  "type": FieldMetadataType.Actor,
                  "name": "createdBy",
                  "label": "Created by",
                  "description": "The creator of the record",
                  "icon": "IconCreativeCommonsSa",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:30.402Z",
                  "updatedAt": "2024-10-30T13:39:30.402Z",
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
                  "id": "7828509e-5d7b-4570-8750-c28b49354575",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:30.402Z",
                  "updatedAt": "2024-10-30T13:39:30.402Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "6711c7b2-2a56-4c3c-813b-4e91daffe7ce",
                  "createdAt": "2024-10-30T13:39:31.573Z",
                  "updatedAt": "2024-10-30T13:39:31.573Z",
                  "name": "IDX_530792e4278e7696c4e3e3e55f8",
                  "indexWhereClause": null,
                  "indexType": IndexType.Gin,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "b492eefa-0496-4ed8-a1b9-3009ba88e696",
                          "createdAt": "2024-10-30T13:39:31.573Z",
                          "updatedAt": "2024-10-30T13:39:31.573Z",
                          "order": 0,
                          "fieldMetadataId": "d9188027-ccae-41e1-9838-fe3908189b25"
                        }
                      }
                    ]
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
          "id": "41302fe4-df07-425f-a492-56d7e6c759af",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "a9e799e8-04d8-4212-827b-ff1b0ecc7b38",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "ff1d122d-a3cf-46b9-a185-d7fa7bc12e30",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "a94aaa8f-4d83-4260-ad12-29868df0fa22",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "79c49e03-c91c-4eef-a490-074608d64643",
                  "type": FieldMetadataType.Boolean,
                  "name": "excludeNonProfessionalEmails",
                  "label": "Exclude non professional emails",
                  "description": "Exclude non professional emails",
                  "icon": "IconBriefcase",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "d0da4da3-fbc7-415c-b0d2-b9bf80b09766",
                  "type": FieldMetadataType.Number,
                  "name": "throttleFailureCount",
                  "label": "Throttle Failure Count",
                  "description": "Throttle Failure Count",
                  "icon": "IconX",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "8d04d998-741f-4b5b-b2cd-c8ce0f919b63",
                  "type": FieldMetadataType.Uuid,
                  "name": "connectedAccountId",
                  "label": "Connected Account id (foreign key)",
                  "description": "Connected Account id foreign key",
                  "icon": "IconUserCircle",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "eb6c610b-edcf-4074-9d91-d0ed9ccea8af",
                  "type": FieldMetadataType.Select,
                  "name": "syncStage",
                  "label": "Sync stage",
                  "description": "Sync stage",
                  "icon": "IconStatusChange",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "'FULL_MESSAGE_LIST_FETCH_PENDING'",
                  "options": [
                    {
                      "id": "f07086a8-5e66-4770-8c43-518ca94768a5",
                      "color": "blue",
                      "label": "Full messages list fetch pending",
                      "value": "FULL_MESSAGE_LIST_FETCH_PENDING",
                      "position": 0
                    },
                    {
                      "id": "68ce99f3-4215-45d5-a1ee-434d78007ec4",
                      "color": "blue",
                      "label": "Partial messages list fetch pending",
                      "value": "PARTIAL_MESSAGE_LIST_FETCH_PENDING",
                      "position": 1
                    },
                    {
                      "id": "924bdeea-3d50-456f-a632-7bd4be19185c",
                      "color": "orange",
                      "label": "Messages list fetch ongoing",
                      "value": "MESSAGE_LIST_FETCH_ONGOING",
                      "position": 2
                    },
                    {
                      "id": "7f61c5ee-5869-48ea-935e-c34008b7465d",
                      "color": "blue",
                      "label": "Messages import pending",
                      "value": "MESSAGES_IMPORT_PENDING",
                      "position": 3
                    },
                    {
                      "id": "15abe226-6ee3-4df5-9e52-751c7ba97cd3",
                      "color": "orange",
                      "label": "Messages import ongoing",
                      "value": "MESSAGES_IMPORT_ONGOING",
                      "position": 4
                    },
                    {
                      "id": "2df6f82f-8bfe-4d3c-9318-c935e763abf1",
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
                  "id": "e39d532b-ed38-4bca-b30e-08d55eabe01a",
                  "type": FieldMetadataType.Boolean,
                  "name": "excludeGroupEmails",
                  "label": "Exclude group emails",
                  "description": "Exclude group emails",
                  "icon": "IconUsersGroup",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "15924ee3-7ad9-4a26-8d72-d85946d3bd7c",
                  "type": FieldMetadataType.Relation,
                  "name": "messageChannelMessageAssociations",
                  "label": "Message Channel Association",
                  "description": "Messages from the channel.",
                  "icon": "IconMessage",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "30021d4e-da40-49d4-a315-f89b75b02830",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "41302fe4-df07-425f-a492-56d7e6c759af",
                      "nameSingular": "messageChannel",
                      "namePlural": "messageChannels"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "15924ee3-7ad9-4a26-8d72-d85946d3bd7c",
                      "name": "messageChannelMessageAssociations"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "211aabc2-5a30-4fd1-9bd3-9a0ba538abf0",
                      "nameSingular": "messageChannelMessageAssociation",
                      "namePlural": "messageChannelMessageAssociations"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "28b5b467-cee4-4a9f-af66-9288006712e5",
                      "name": "messageChannel"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "f8f9c4cc-142e-4192-8490-679760092209",
                  "type": FieldMetadataType.Select,
                  "name": "visibility",
                  "label": "Visibility",
                  "description": "Visibility",
                  "icon": "IconEyeglass",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "'SHARE_EVERYTHING'",
                  "options": [
                    {
                      "id": "d09b5abc-4f44-4316-a4e8-4371ee24259e",
                      "color": "green",
                      "label": "Metadata",
                      "value": "METADATA",
                      "position": 0
                    },
                    {
                      "id": "36d015e7-b84c-4df0-9810-25a4acc3af38",
                      "color": "blue",
                      "label": "Subject",
                      "value": "SUBJECT",
                      "position": 1
                    },
                    {
                      "id": "bd2af565-c7d7-445c-a095-ea0eea5270e8",
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
                  "id": "85ec6f07-9b20-47ba-b726-cb8125922064",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "54c932c5-1b6d-4a40-96de-cc732914e702",
                  "type": FieldMetadataType.Boolean,
                  "name": "isContactAutoCreationEnabled",
                  "label": "Is Contact Auto Creation Enabled",
                  "description": "Is Contact Auto Creation Enabled",
                  "icon": "IconUserCircle",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "db15aa14-bc46-41d8-b749-34b31394184f",
                  "type": FieldMetadataType.Text,
                  "name": "syncCursor",
                  "label": "Last sync cursor",
                  "description": "Last sync cursor",
                  "icon": "IconHistory",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "300f4749-0ff8-4dc8-b674-b3bd5ad3110b",
                  "type": FieldMetadataType.Select,
                  "name": "syncStatus",
                  "label": "Sync status",
                  "description": "Sync status",
                  "icon": "IconStatusChange",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": [
                    {
                      "id": "9da2a12e-c914-4139-bf5c-f9606d8098b4",
                      "color": "yellow",
                      "label": "Ongoing",
                      "value": "ONGOING",
                      "position": 1
                    },
                    {
                      "id": "34348c77-b192-4c8d-ad1b-c660ea1c8774",
                      "color": "blue",
                      "label": "Not Synced",
                      "value": "NOT_SYNCED",
                      "position": 2
                    },
                    {
                      "id": "c2978108-4d65-4488-bd23-6db7eb0fc595",
                      "color": "green",
                      "label": "Active",
                      "value": "ACTIVE",
                      "position": 3
                    },
                    {
                      "id": "58edf1b3-f54c-4616-bf4a-607e0281c48f",
                      "color": "red",
                      "label": "Failed Insufficient Permissions",
                      "value": "FAILED_INSUFFICIENT_PERMISSIONS",
                      "position": 4
                    },
                    {
                      "id": "917288f3-7d06-4305-a11b-173eb627302f",
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
                  "id": "bb1e103c-2def-41fc-9172-8c737760d11b",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "81046ac4-881c-4c2c-b602-24a02c853eb0",
                  "type": FieldMetadataType.Select,
                  "name": "type",
                  "label": "Type",
                  "description": "Channel Type",
                  "icon": "IconMessage",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "'email'",
                  "options": [
                    {
                      "id": "d1ccbf6d-587c-4ade-aff1-d5c877084dc0",
                      "color": "green",
                      "label": "Email",
                      "value": "email",
                      "position": 0
                    },
                    {
                      "id": "55b6b4b8-2468-41f9-b17f-2487f1a511c4",
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
                  "id": "cd970e61-b53d-4803-9642-08bc6df5f657",
                  "type": FieldMetadataType.Select,
                  "name": "contactAutoCreationPolicy",
                  "label": "Contact auto creation policy",
                  "description": "Automatically create People records when receiving or sending emails",
                  "icon": "IconUserCircle",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "'SENT'",
                  "options": [
                    {
                      "id": "294f8bac-264e-4aca-b69f-2db6593f5172",
                      "color": "green",
                      "label": "Sent and Received",
                      "value": "SENT_AND_RECEIVED",
                      "position": 0
                    },
                    {
                      "id": "37f6fe62-fd6e-4765-a0d8-4f834f8b7847",
                      "color": "blue",
                      "label": "Sent",
                      "value": "SENT",
                      "position": 1
                    },
                    {
                      "id": "d4214abe-e542-4081-98fa-c6c49f89fb4c",
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
                  "id": "3fe1b730-e78c-4d37-be65-ac77f38ee433",
                  "type": FieldMetadataType.DateTime,
                  "name": "syncStageStartedAt",
                  "label": "Sync stage started at",
                  "description": "Sync stage started at",
                  "icon": "IconHistory",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "8d1710d6-bacf-45ba-ab4c-bfce4c3980a1",
                  "type": FieldMetadataType.DateTime,
                  "name": "syncedAt",
                  "label": "Last sync date",
                  "description": "Last sync date",
                  "icon": "IconHistory",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "a9e799e8-04d8-4212-827b-ff1b0ecc7b38",
                  "type": FieldMetadataType.Text,
                  "name": "handle",
                  "label": "Handle",
                  "description": "Handle",
                  "icon": "IconAt",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "fd38bf5a-9daa-4db1-9aff-a644a9a31bfb",
                  "type": FieldMetadataType.Relation,
                  "name": "connectedAccount",
                  "label": "Connected Account",
                  "description": "Connected Account",
                  "icon": "IconUserCircle",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "80daf432-7306-4951-be4c-14e92bfc7d68",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "41302fe4-df07-425f-a492-56d7e6c759af",
                      "nameSingular": "messageChannel",
                      "namePlural": "messageChannels"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "fd38bf5a-9daa-4db1-9aff-a644a9a31bfb",
                      "name": "connectedAccount"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "5c1e17cb-3ed9-4024-b427-fe576d6ce3d1",
                      "nameSingular": "connectedAccount",
                      "namePlural": "connectedAccounts"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "e189a013-da4a-43ee-ae9d-3e7d87bd6750",
                      "name": "messageChannels"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "23915aea-8c4f-44a9-a0f3-e4a67d9bcb15",
                  "type": FieldMetadataType.Boolean,
                  "name": "isSyncEnabled",
                  "label": "Is Sync Enabled",
                  "description": "Is Sync Enabled",
                  "icon": "IconRefresh",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": true,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "fd6a9a69-2250-4abd-a1a4-ce60cc44d271",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_c3af632ce35236d21f8ae1f4cfd",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "0fe4b1dd-6015-4cfb-a985-04fd0c2b6372",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "85ec6f07-9b20-47ba-b726-cb8125922064"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "3022a459-747f-4c89-9b37-a969d140ffd5",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "8d04d998-741f-4b5b-b2cd-c8ce0f919b63"
                        }
                      }
                    ]
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
          "id": "3afda1a8-e7ea-45e9-9c0c-f744ace5c20d",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "3918bf9b-030c-41ab-ba8b-77c078e43556",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "b2fe1ee8-aab2-484a-87fa-edd6e1fc30c7",
                  "type": FieldMetadataType.Relation,
                  "name": "person",
                  "label": "Person",
                  "description": "Person",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "7a994c6c-6574-45cd-b8f3-6268cf5e952a",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "3afda1a8-e7ea-45e9-9c0c-f744ace5c20d",
                      "nameSingular": "messageParticipant",
                      "namePlural": "messageParticipants"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "b2fe1ee8-aab2-484a-87fa-edd6e1fc30c7",
                      "name": "person"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "1c05dac8-29f7-4f1e-9f61-579ad0eb647d",
                      "nameSingular": "person",
                      "namePlural": "people"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "9426bebc-fdd6-447a-9fb6-3bfaee7842ea",
                      "name": "messageParticipants"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "52800001-3dda-4f49-b8bf-be7fc6f61556",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "98d6b9f9-c959-4d35-8482-9c9733ed9981",
                  "type": FieldMetadataType.Select,
                  "name": "role",
                  "label": "Role",
                  "description": "Role",
                  "icon": "IconAt",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "'from'",
                  "options": [
                    {
                      "id": "c017ca18-bfab-461c-b3ba-7a9239a7a407",
                      "color": "green",
                      "label": "From",
                      "value": "from",
                      "position": 0
                    },
                    {
                      "id": "d481cb1d-4dbf-4daf-af74-192efdb7f5dd",
                      "color": "blue",
                      "label": "To",
                      "value": "to",
                      "position": 1
                    },
                    {
                      "id": "15ce163c-ab02-4613-955d-2f1ab6145757",
                      "color": "orange",
                      "label": "Cc",
                      "value": "cc",
                      "position": 2
                    },
                    {
                      "id": "abd7e424-7849-41b3-a605-5e810ac49d18",
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
                  "id": "ca27f91e-b872-4d80-8ba1-7c597fa85d8e",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "44d07778-3da5-4904-93cb-b357587f0c90",
                  "type": FieldMetadataType.Uuid,
                  "name": "personId",
                  "label": "Person id (foreign key)",
                  "description": "Person id foreign key",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "b1f309af-ccb7-4eae-8631-3fe44dba70ad",
                  "type": FieldMetadataType.Uuid,
                  "name": "messageId",
                  "label": "Message id (foreign key)",
                  "description": "Message id foreign key",
                  "icon": "IconMessage",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "3918bf9b-030c-41ab-ba8b-77c078e43556",
                  "type": FieldMetadataType.Text,
                  "name": "handle",
                  "label": "Handle",
                  "description": "Handle",
                  "icon": "IconAt",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "a2b20d09-a23b-4de0-9ca8-2f1877a0f6d9",
                  "type": FieldMetadataType.Relation,
                  "name": "workspaceMember",
                  "label": "Workspace Member",
                  "description": "Workspace member",
                  "icon": "IconCircleUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "401899ac-1ea1-4b2a-bc9f-e8dbc0376245",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "3afda1a8-e7ea-45e9-9c0c-f744ace5c20d",
                      "nameSingular": "messageParticipant",
                      "namePlural": "messageParticipants"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "a2b20d09-a23b-4de0-9ca8-2f1877a0f6d9",
                      "name": "workspaceMember"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "a6ae81d6-b50b-4183-a2bb-ebcc0428dd53",
                      "nameSingular": "workspaceMember",
                      "namePlural": "workspaceMembers"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "0acbe745-ae2d-4aac-a40d-0fb42b54c75f",
                      "name": "messageParticipants"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "e81aa525-bd38-4997-8e27-26cc4a66c2fe",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "0ef3752f-1bc0-4d67-9d0c-599b981a26b8",
                  "type": FieldMetadataType.Uuid,
                  "name": "workspaceMemberId",
                  "label": "Workspace Member id (foreign key)",
                  "description": "Workspace member id foreign key",
                  "icon": "IconCircleUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "ab98dafe-fd9d-4389-84ba-30f574b79635",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "2e4c0b4e-d671-42e5-a7f4-e3a1af5487a9",
                  "type": FieldMetadataType.Text,
                  "name": "displayName",
                  "label": "Display Name",
                  "description": "Display Name",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "fa1e799d-454a-4378-8d66-9e4a5db2c1dd",
                  "type": FieldMetadataType.Relation,
                  "name": "message",
                  "label": "Message",
                  "description": "Message",
                  "icon": "IconMessage",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "d6c12477-afe4-4049-b08b-7c9ff92cb7bf",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "3afda1a8-e7ea-45e9-9c0c-f744ace5c20d",
                      "nameSingular": "messageParticipant",
                      "namePlural": "messageParticipants"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "fa1e799d-454a-4378-8d66-9e4a5db2c1dd",
                      "name": "message"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "3385d352-10a0-428f-9863-e52e7164b26c",
                      "nameSingular": "message",
                      "namePlural": "messages"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "4d5495d2-c533-4815-93ca-13202a2094c2",
                      "name": "messageParticipants"
                    }
                  }
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "c832dc8d-3800-4213-9055-b1fc7a7ae26c",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_6d9700e5ae2ab8c294d614e72f6",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "94518824-c085-4900-abc9-c6bb7fb27786",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "ab98dafe-fd9d-4389-84ba-30f574b79635"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "983d2969-2e89-4c77-a83b-a895989b05b4",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "44d07778-3da5-4904-93cb-b357587f0c90"
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
                  "id": "ac34dec5-6ee7-4418-b5b2-3362f9297c84",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_8d0144e4074d86d0cb7094f40c2",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "fa4fea97-e777-4bf4-a72a-a7a1fe33f477",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "b1f309af-ccb7-4eae-8631-3fe44dba70ad"
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
                  "id": "230398ef-3308-4fb1-949b-cf5b9e17d4bf",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_8c4f617db0813d41aef587e49ea",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "780b35b6-0bc7-40d6-909a-3db8adfd45c2",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "ab98dafe-fd9d-4389-84ba-30f574b79635"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "8de85583-d4dd-4948-93f7-139321357898",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "0ef3752f-1bc0-4d67-9d0c-599b981a26b8"
                        }
                      }
                    ]
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
          "id": "3385d352-10a0-428f-9863-e52e7164b26c",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "b25c54aa-6d15-40c6-9b2c-27a5e7b774b1",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "4103946d-4b6a-400a-b678-059f24c50384",
                  "type": FieldMetadataType.Relation,
                  "name": "messageChannelMessageAssociations",
                  "label": "Message Channel Association",
                  "description": "Messages from the channel.",
                  "icon": "IconMessage",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "f7b1e9df-5c65-4d64-9cf4-8065aa5edd58",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "3385d352-10a0-428f-9863-e52e7164b26c",
                      "nameSingular": "message",
                      "namePlural": "messages"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "4103946d-4b6a-400a-b678-059f24c50384",
                      "name": "messageChannelMessageAssociations"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "211aabc2-5a30-4fd1-9bd3-9a0ba538abf0",
                      "nameSingular": "messageChannelMessageAssociation",
                      "namePlural": "messageChannelMessageAssociations"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "91ec1ccb-08be-4adf-a3ab-8ab11724226b",
                      "name": "message"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "a30c26e1-732f-499e-9833-4bd927d880dd",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "b25c54aa-6d15-40c6-9b2c-27a5e7b774b1",
                  "type": FieldMetadataType.Text,
                  "name": "subject",
                  "label": "Subject",
                  "description": "Subject",
                  "icon": "IconMessage",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "f5712b89-13c6-41f1-aa83-7bfd7b3819e5",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "9f312e72-387a-4614-8ae2-2d1e8a91e30d",
                  "type": FieldMetadataType.DateTime,
                  "name": "receivedAt",
                  "label": "Received At",
                  "description": "The date the message was received",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "b9307733-6f67-4d79-8c41-78e845878795",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "4d5495d2-c533-4815-93ca-13202a2094c2",
                  "type": FieldMetadataType.Relation,
                  "name": "messageParticipants",
                  "label": "Message Participants",
                  "description": "Message Participants",
                  "icon": "IconUserCircle",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "d6c12477-afe4-4049-b08b-7c9ff92cb7bf",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "3385d352-10a0-428f-9863-e52e7164b26c",
                      "nameSingular": "message",
                      "namePlural": "messages"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "4d5495d2-c533-4815-93ca-13202a2094c2",
                      "name": "messageParticipants"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "3afda1a8-e7ea-45e9-9c0c-f744ace5c20d",
                      "nameSingular": "messageParticipant",
                      "namePlural": "messageParticipants"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "fa1e799d-454a-4378-8d66-9e4a5db2c1dd",
                      "name": "message"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "1d2dea39-4d37-4f1e-96e9-e98fa7554588",
                  "type": FieldMetadataType.Text,
                  "name": "text",
                  "label": "text",
                  "description": "text",
                  "icon": "IconMessage",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "baa23263-3324-4ae4-9117-fc541522b2c8",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "054c92a8-5268-4ebb-94b8-ad4f7944da52",
                  "type": FieldMetadataType.Text,
                  "name": "headerMessageId",
                  "label": "Header message Id",
                  "description": "Message id from the message header",
                  "icon": "IconHash",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "79d2deca-9d03-4cf5-a618-2b0afe85c37d",
                  "type": FieldMetadataType.Relation,
                  "name": "messageThread",
                  "label": "Message Thread Id",
                  "description": "Message Thread Id",
                  "icon": "IconHash",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "4499287d-ffad-4966-a043-e5fecd6489a9",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "3385d352-10a0-428f-9863-e52e7164b26c",
                      "nameSingular": "message",
                      "namePlural": "messages"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "79d2deca-9d03-4cf5-a618-2b0afe85c37d",
                      "name": "messageThread"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "a031797c-fd59-4072-bad0-0f17a6236871",
                      "nameSingular": "messageThread",
                      "namePlural": "messageThreads"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "2df434a7-1218-409a-91a9-9030eccf3e25",
                      "name": "messages"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "e5851ae9-cfdc-4225-8ee5-fd6ce2135c8d",
                  "type": FieldMetadataType.Uuid,
                  "name": "messageThreadId",
                  "label": "Message Thread Id id (foreign key)",
                  "description": "Message Thread Id id foreign key",
                  "icon": "IconHash",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "ed3e314e-62c5-4742-8695-0c1dcb9fc956",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_78fa73d661d632619e17de211e6",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "b54f6c52-082c-4a42-896f-80b056b36977",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "f5712b89-13c6-41f1-aa83-7bfd7b3819e5"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "528f7f21-ce56-4e45-bda2-3e546a04df8d",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "e5851ae9-cfdc-4225-8ee5-fd6ce2135c8d"
                        }
                      }
                    ]
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
          "id": "25e10253-f0e1-4a6d-90e3-ad62a4b20292",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "42dbfb82-87f9-47b8-b0ec-0eebcaaf369d",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": "T",
          "isLabelSyncedWithName": false,
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
                  "id": "1972681e-7f09-4670-bff0-add3fc297c30",
                  "type": FieldMetadataType.Select,
                  "name": "status",
                  "label": "Status",
                  "description": "Task status",
                  "icon": "IconCheck",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "'TODO'",
                  "options": [
                    {
                      "id": "1b9a4dd1-9208-47ad-a833-bb55661a4502",
                      "color": "sky",
                      "label": "To do",
                      "value": "TODO",
                      "position": 0
                    },
                    {
                      "id": "065d70d4-2840-4f1d-8ad1-2d5eac4e185e",
                      "color": "purple",
                      "label": "In progress",
                      "value": "IN_PROGRESS",
                      "position": 1
                    },
                    {
                      "id": "7b778c14-9f44-4e0e-b003-cca0275525c2",
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
                  "id": "42dbfb82-87f9-47b8-b0ec-0eebcaaf369d",
                  "type": FieldMetadataType.Text,
                  "name": "title",
                  "label": "Title",
                  "description": "Task title",
                  "icon": "IconNotes",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "b86ee0bd-5e4d-4d91-8d2a-1473d155dc42",
                  "type": FieldMetadataType.Relation,
                  "name": "favorites",
                  "label": "Favorites",
                  "description": "Favorites linked to the task",
                  "icon": "IconHeart",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "2668313f-71ee-4c11-8098-7ffeae4ac8d0",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "25e10253-f0e1-4a6d-90e3-ad62a4b20292",
                      "nameSingular": "task",
                      "namePlural": "tasks"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "b86ee0bd-5e4d-4d91-8d2a-1473d155dc42",
                      "name": "favorites"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "6d72fd09-755d-409b-8455-f74da70fa9c1",
                      "nameSingular": "favorite",
                      "namePlural": "favorites"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "2c5cecbb-1e99-478d-bd77-f3f2ee66efda",
                      "name": "task"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "598b87cb-3d76-43e8-a4fa-beb10772f675",
                  "type": FieldMetadataType.Relation,
                  "name": "assignee",
                  "label": "Assignee",
                  "description": "Task assignee",
                  "icon": "IconUserCircle",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "ea04a6cc-b565-4da2-afff-fade0a20d08d",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "25e10253-f0e1-4a6d-90e3-ad62a4b20292",
                      "nameSingular": "task",
                      "namePlural": "tasks"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "598b87cb-3d76-43e8-a4fa-beb10772f675",
                      "name": "assignee"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "a6ae81d6-b50b-4183-a2bb-ebcc0428dd53",
                      "nameSingular": "workspaceMember",
                      "namePlural": "workspaceMembers"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "611f0f9b-d4d3-42b6-9bb5-ab8d33e3befc",
                      "name": "assignedTasks"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "56c91566-aa07-429a-804c-e1e9264d2312",
                  "type": FieldMetadataType.Relation,
                  "name": "timelineActivities",
                  "label": "Timeline Activities",
                  "description": "Timeline Activities linked to the task.",
                  "icon": "IconTimelineEvent",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "44687a34-fc9d-47aa-8559-acdd7580e81e",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "25e10253-f0e1-4a6d-90e3-ad62a4b20292",
                      "nameSingular": "task",
                      "namePlural": "tasks"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "56c91566-aa07-429a-804c-e1e9264d2312",
                      "name": "timelineActivities"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "082301c2-cd4d-4cdf-ab5a-98a71d493036",
                      "nameSingular": "timelineActivity",
                      "namePlural": "timelineActivities"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "738e965d-814a-4ab4-a66c-21ae2bb9ad35",
                      "name": "task"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "0426d319-3928-4dfc-93ce-d4cc6172b30d",
                  "type": FieldMetadataType.Relation,
                  "name": "attachments",
                  "label": "Attachments",
                  "description": "Task attachments",
                  "icon": "IconFileImport",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "10a59354-1c7c-4f9d-8ef4-5834319fbed0",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "25e10253-f0e1-4a6d-90e3-ad62a4b20292",
                      "nameSingular": "task",
                      "namePlural": "tasks"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "0426d319-3928-4dfc-93ce-d4cc6172b30d",
                      "name": "attachments"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "ba95cbd9-694f-4ae5-906d-1f7cd213c9fe",
                      "nameSingular": "attachment",
                      "namePlural": "attachments"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "e1186bb6-6864-4a5e-99bb-c77c2a3fd747",
                      "name": "task"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "b69d4c32-d83d-40b6-947b-fa6cca32990e",
                  "type": FieldMetadataType.TsVector,
                  "name": "searchVector",
                  "label": "Search vector",
                  "description": "Field used for full-text search",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "7966cbeb-0597-418f-9ae6-6a35e9c527cc",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "550afb9c-6f7e-444b-b4fa-2b6a4ae15843",
                  "type": FieldMetadataType.Relation,
                  "name": "taskTargets",
                  "label": "Relations",
                  "description": "Task targets",
                  "icon": "IconArrowUpRight",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "0e8029bc-671b-4842-9911-81942fe6220f",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "25e10253-f0e1-4a6d-90e3-ad62a4b20292",
                      "nameSingular": "task",
                      "namePlural": "tasks"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "550afb9c-6f7e-444b-b4fa-2b6a4ae15843",
                      "name": "taskTargets"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "84c4f534-4798-47ab-b725-a122e966ae9e",
                      "nameSingular": "taskTarget",
                      "namePlural": "taskTargets"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "60309d2d-c7d6-4ea5-9dc6-b48609cd8b7f",
                      "name": "task"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "8fb75668-dd20-4415-b86b-c14f4385bc4d",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "eac0db6a-693a-4a42-a01d-5c870f47e894",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "a7625918-c9d4-40c3-8ad8-de262e179dcc",
                  "type": FieldMetadataType.DateTime,
                  "name": "dueAt",
                  "label": "Due Date",
                  "description": "Task due date",
                  "icon": "IconCalendarEvent",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "10272df2-3022-43df-bc9a-e2b4f2727446",
                  "type": FieldMetadataType.Position,
                  "name": "position",
                  "label": "Position",
                  "description": "Task record position",
                  "icon": "IconHierarchy2",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "cebaca52-5e67-4901-b6a4-c25e7b19f199",
                  "type": FieldMetadataType.RichText,
                  "name": "body",
                  "label": "Body",
                  "description": "Task body",
                  "icon": "IconFilePencil",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "7dcf00cb-3d0f-47a2-b7c9-927b961f6520",
                  "type": FieldMetadataType.Uuid,
                  "name": "assigneeId",
                  "label": "Assignee id (foreign key)",
                  "description": "Task assignee id foreign key",
                  "icon": "IconUserCircle",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "d74a46d9-9807-4252-a8e6-62130055356d",
                  "type": FieldMetadataType.Actor,
                  "name": "createdBy",
                  "label": "Created by",
                  "description": "The creator of the record",
                  "icon": "IconCreativeCommonsSa",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "fea58455-f3c7-461b-9e6a-74378e9a365f",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "5f0839ca-5308-4870-86fa-e7ae8308b1ac",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_ee5298b25512b38b29390e084f7",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "9a6068de-4223-489f-b358-e3c3a55c8b83",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "7dcf00cb-3d0f-47a2-b7c9-927b961f6520"
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
                  "id": "c8c6f567-9799-4ca8-9820-a099c5bf495c",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_d01a000cf26e1225d894dc3d364",
                  "indexWhereClause": null,
                  "indexType": IndexType.Gin,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "bd85a32c-5922-4f56-a51b-95beceefb0bf",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "b69d4c32-d83d-40b6-947b-fa6cca32990e"
                        }
                      }
                    ]
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
          "id": "211aabc2-5a30-4fd1-9bd3-9a0ba538abf0",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "77fb099a-9f24-4d7d-8da2-6898e48bf868",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "95ca22c3-2c92-4321-b514-391a861f41d2",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "77fb099a-9f24-4d7d-8da2-6898e48bf868",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "91ec1ccb-08be-4adf-a3ab-8ab11724226b",
                  "type": FieldMetadataType.Relation,
                  "name": "message",
                  "label": "Message Id",
                  "description": "Message Id",
                  "icon": "IconHash",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "f7b1e9df-5c65-4d64-9cf4-8065aa5edd58",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "211aabc2-5a30-4fd1-9bd3-9a0ba538abf0",
                      "nameSingular": "messageChannelMessageAssociation",
                      "namePlural": "messageChannelMessageAssociations"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "91ec1ccb-08be-4adf-a3ab-8ab11724226b",
                      "name": "message"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "3385d352-10a0-428f-9863-e52e7164b26c",
                      "nameSingular": "message",
                      "namePlural": "messages"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "4103946d-4b6a-400a-b678-059f24c50384",
                      "name": "messageChannelMessageAssociations"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "28b5b467-cee4-4a9f-af66-9288006712e5",
                  "type": FieldMetadataType.Relation,
                  "name": "messageChannel",
                  "label": "Message Channel Id",
                  "description": "Message Channel Id",
                  "icon": "IconHash",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "30021d4e-da40-49d4-a315-f89b75b02830",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "211aabc2-5a30-4fd1-9bd3-9a0ba538abf0",
                      "nameSingular": "messageChannelMessageAssociation",
                      "namePlural": "messageChannelMessageAssociations"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "28b5b467-cee4-4a9f-af66-9288006712e5",
                      "name": "messageChannel"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "41302fe4-df07-425f-a492-56d7e6c759af",
                      "nameSingular": "messageChannel",
                      "namePlural": "messageChannels"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "15924ee3-7ad9-4a26-8d72-d85946d3bd7c",
                      "name": "messageChannelMessageAssociations"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "8e1bc985-0e92-4a0c-b617-88c2f5b15f55",
                  "type": FieldMetadataType.Uuid,
                  "name": "messageId",
                  "label": "Message Id id (foreign key)",
                  "description": "Message Id id foreign key",
                  "icon": "IconHash",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "a97d7645-9586-457f-81f5-5a567ff5d6da",
                  "type": FieldMetadataType.Uuid,
                  "name": "messageChannelId",
                  "label": "Message Channel Id id (foreign key)",
                  "description": "Message Channel Id id foreign key",
                  "icon": "IconHash",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "63b8c9e7-5867-42e1-be52-1efd5db6ecc8",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "eeaaad9c-de19-4d15-9e7b-095f866527d5",
                  "type": FieldMetadataType.Select,
                  "name": "direction",
                  "label": "Direction",
                  "description": "Message Direction",
                  "icon": "IconDirection",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "'INCOMING'",
                  "options": [
                    {
                      "id": "f2951ff1-b4fa-4aa2-b52a-471d114240c6",
                      "color": "green",
                      "label": "Incoming",
                      "value": "INCOMING",
                      "position": 0
                    },
                    {
                      "id": "d6340b38-8408-42a1-866b-8f0ccb08b599",
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
                  "id": "010a9826-31ef-4faf-8ded-e645b247c81b",
                  "type": FieldMetadataType.Text,
                  "name": "messageThreadExternalId",
                  "label": "Thread External Id",
                  "description": "Thread id from the messaging provider",
                  "icon": "IconHash",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "c7efc927-fec2-483a-8ff9-58c7f63d76bc",
                  "type": FieldMetadataType.Text,
                  "name": "messageExternalId",
                  "label": "Message External Id",
                  "description": "Message id from the messaging provider",
                  "icon": "IconHash",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "4282b1d4-741b-4aac-94bd-b86e2e1afc97",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "d7d9eb3b-9b4f-45cd-a477-cdc2785141d8",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_63953e5f88351922043480b8801",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "47f98922-90a6-4591-a442-a0a8a354dbb3",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "63b8c9e7-5867-42e1-be52-1efd5db6ecc8"
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
                  "id": "5de68cec-3ff9-4817-b180-7770d3e0881b",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_671dd9e01a80d1e4c89fc166c3b",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "c28d0b25-7d0d-43fd-afd1-e8cf37ce8b19",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "63b8c9e7-5867-42e1-be52-1efd5db6ecc8"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "8eca0b5c-8449-4ba2-b2d7-ba2cc07bc34a",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "8e1bc985-0e92-4a0c-b617-88c2f5b15f55"
                        }
                      }
                    ]
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
          "id": "1c05dac8-29f7-4f1e-9f61-579ad0eb647d",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "b351539f-6af9-45bf-9ee3-371368b83022",
          "imageIdentifierFieldMetadataId": "55055af5-6236-41b5-9e3f-62ab6230c1f1",
          "shortcut": "P",
          "isLabelSyncedWithName": false,
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
                  "id": "a779e00c-68fe-4d04-a364-45e3b7c0d2b5",
                  "type": FieldMetadataType.Emails,
                  "name": "emails",
                  "label": "Emails",
                  "description": "Contact’s Emails",
                  "icon": "IconMail",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": true,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "871a1a8f-47c3-4fb6-985e-8625a9483f9a",
                  "type": FieldMetadataType.Links,
                  "name": "xLink",
                  "label": "X",
                  "description": "Contact’s X/Twitter account",
                  "icon": "IconBrandX",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "b03b3153-a062-4dcd-9a40-d8401726f752",
                  "type": FieldMetadataType.Phones,
                  "name": "whatsapp",
                  "label": "Whatsapp",
                  "description": "Contact's Whatsapp Number",
                  "icon": "IconBrandWhatsapp",
                  "isCustom": true,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:27.328Z",
                  "updatedAt": "2024-10-30T13:39:27.328Z",
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
                  "id": "74aeccd6-9d05-4b91-aade-8a90f4dbd052",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "8ef8d5ba-dad9-41ac-96d5-75d8659e21ff",
                  "type": FieldMetadataType.Links,
                  "name": "linkedinLink",
                  "label": "Linkedin",
                  "description": "Contact’s Linkedin account",
                  "icon": "IconBrandLinkedin",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "e847601f-dcaf-45f1-a7a1-5530742ef765",
                  "type": FieldMetadataType.Relation,
                  "name": "timelineActivities",
                  "label": "Events",
                  "description": "Events linked to the person",
                  "icon": "IconTimelineEvent",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "8bf3b5fc-d140-43fb-bbf4-1983fd6ece66",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "1c05dac8-29f7-4f1e-9f61-579ad0eb647d",
                      "nameSingular": "person",
                      "namePlural": "people"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "e847601f-dcaf-45f1-a7a1-5530742ef765",
                      "name": "timelineActivities"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "082301c2-cd4d-4cdf-ab5a-98a71d493036",
                      "nameSingular": "timelineActivity",
                      "namePlural": "timelineActivities"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "8e0c042c-64a9-4d82-9800-c58b093eda5a",
                      "name": "person"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "9426bebc-fdd6-447a-9fb6-3bfaee7842ea",
                  "type": FieldMetadataType.Relation,
                  "name": "messageParticipants",
                  "label": "Message Participants",
                  "description": "Message Participants",
                  "icon": "IconUserCircle",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "7a994c6c-6574-45cd-b8f3-6268cf5e952a",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "1c05dac8-29f7-4f1e-9f61-579ad0eb647d",
                      "nameSingular": "person",
                      "namePlural": "people"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "9426bebc-fdd6-447a-9fb6-3bfaee7842ea",
                      "name": "messageParticipants"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "3afda1a8-e7ea-45e9-9c0c-f744ace5c20d",
                      "nameSingular": "messageParticipant",
                      "namePlural": "messageParticipants"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "b2fe1ee8-aab2-484a-87fa-edd6e1fc30c7",
                      "name": "person"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "6586555e-28ad-4b8a-855b-f8cbbd327c13",
                  "type": FieldMetadataType.Relation,
                  "name": "favorites",
                  "label": "Favorites",
                  "description": "Favorites linked to the contact",
                  "icon": "IconHeart",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "6e7d8470-4f3e-415d-843c-306380a483f0",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "1c05dac8-29f7-4f1e-9f61-579ad0eb647d",
                      "nameSingular": "person",
                      "namePlural": "people"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "6586555e-28ad-4b8a-855b-f8cbbd327c13",
                      "name": "favorites"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "6d72fd09-755d-409b-8455-f74da70fa9c1",
                      "nameSingular": "favorite",
                      "namePlural": "favorites"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "bd0b3981-63dd-4a8d-95cf-71080dae3364",
                      "name": "person"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "bc5fe4dd-e737-4596-bbb2-50660f43b920",
                  "type": FieldMetadataType.Relation,
                  "name": "attachments",
                  "label": "Attachments",
                  "description": "Attachments linked to the contact.",
                  "icon": "IconFileImport",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "13103358-7184-4a0c-87e7-1f622480cb36",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "1c05dac8-29f7-4f1e-9f61-579ad0eb647d",
                      "nameSingular": "person",
                      "namePlural": "people"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "bc5fe4dd-e737-4596-bbb2-50660f43b920",
                      "name": "attachments"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "ba95cbd9-694f-4ae5-906d-1f7cd213c9fe",
                      "nameSingular": "attachment",
                      "namePlural": "attachments"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "4ccca276-e876-4a1d-b64b-12ab3242b605",
                      "name": "person"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "3085019f-5351-42ce-9a40-8852f4245257",
                  "type": FieldMetadataType.Actor,
                  "name": "createdBy",
                  "label": "Created by",
                  "description": "The creator of the record",
                  "icon": "IconCreativeCommonsSa",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "d48b7e4c-41a6-4e45-8349-94848e6a21a8",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "55055af5-6236-41b5-9e3f-62ab6230c1f1",
                  "type": FieldMetadataType.Text,
                  "name": "avatarUrl",
                  "label": "Avatar",
                  "description": "Contact’s avatar",
                  "icon": "IconFileUpload",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "64a9cad7-d61f-406f-b7f1-7da640768757",
                  "type": FieldMetadataType.Text,
                  "name": "intro",
                  "label": "Intro",
                  "description": "Contact's Intro",
                  "icon": "IconNote",
                  "isCustom": true,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:26.387Z",
                  "updatedAt": "2024-10-30T13:39:26.387Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "ad176aea-890e-4e7c-b0e5-67d9b9717e02",
                  "type": FieldMetadataType.Relation,
                  "name": "calendarEventParticipants",
                  "label": "Calendar Event Participants",
                  "description": "Calendar Event Participants",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "194734ec-9308-4711-b6ec-3ede45a44978",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "1c05dac8-29f7-4f1e-9f61-579ad0eb647d",
                      "nameSingular": "person",
                      "namePlural": "people"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "ad176aea-890e-4e7c-b0e5-67d9b9717e02",
                      "name": "calendarEventParticipants"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "5706c0cc-9d33-4bb8-8b6d-db74b8d882c8",
                      "nameSingular": "calendarEventParticipant",
                      "namePlural": "calendarEventParticipants"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "dfd280bd-60f5-4291-bff3-ee40a512afd6",
                      "name": "person"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "334443ec-bfd0-4492-8edd-9dd7def5f73e",
                  "type": FieldMetadataType.Relation,
                  "name": "company",
                  "label": "Company",
                  "description": "Contact’s company",
                  "icon": "IconBuildingSkyscraper",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "66654d28-8ce1-4750-8bd3-ba30a97af1eb",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "1c05dac8-29f7-4f1e-9f61-579ad0eb647d",
                      "nameSingular": "person",
                      "namePlural": "people"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "334443ec-bfd0-4492-8edd-9dd7def5f73e",
                      "name": "company"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "af4e5bad-fa25-46ab-b32e-1147b5210107",
                      "nameSingular": "company",
                      "namePlural": "companies"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "ea7e9ce5-c5f7-404e-9439-ad9edf5d03cf",
                      "name": "people"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "32a8f4c6-c106-4071-ae5f-03f847a114f9",
                  "type": FieldMetadataType.TsVector,
                  "name": "searchVector",
                  "label": "Search vector",
                  "description": "Field used for full-text search",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "3b362fc7-92be-455e-b926-2e6f42c359e3",
                  "type": FieldMetadataType.Position,
                  "name": "position",
                  "label": "Position",
                  "description": "Person record Position",
                  "icon": "IconHierarchy2",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "dbec4d0c-a037-42d9-8e49-b945f65eec23",
                  "type": FieldMetadataType.Relation,
                  "name": "pointOfContactForOpportunities",
                  "label": "Linked Opportunities",
                  "description": "List of opportunities for which that person is the point of contact",
                  "icon": "IconTargetArrow",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "6aa55cb7-0038-495b-97f2-c80a48c5819a",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "1c05dac8-29f7-4f1e-9f61-579ad0eb647d",
                      "nameSingular": "person",
                      "namePlural": "people"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "dbec4d0c-a037-42d9-8e49-b945f65eec23",
                      "name": "pointOfContactForOpportunities"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "e85877ca-dc73-4b9e-b9b7-139dc06ca7b7",
                      "nameSingular": "opportunity",
                      "namePlural": "opportunities"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "fb964332-c2a5-43d0-8da1-ff7127fa0a42",
                      "name": "pointOfContact"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "2ae260b8-4aae-4f5e-8d2d-a073d280c837",
                  "type": FieldMetadataType.Relation,
                  "name": "taskTargets",
                  "label": "Tasks",
                  "description": "Tasks tied to the contact",
                  "icon": "IconCheckbox",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "e2479abf-7807-4ac0-b640-581e95bef640",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "1c05dac8-29f7-4f1e-9f61-579ad0eb647d",
                      "nameSingular": "person",
                      "namePlural": "people"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "2ae260b8-4aae-4f5e-8d2d-a073d280c837",
                      "name": "taskTargets"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "84c4f534-4798-47ab-b725-a122e966ae9e",
                      "nameSingular": "taskTarget",
                      "namePlural": "taskTargets"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "b2bbd05f-98d5-49bd-a690-61469162f76c",
                      "name": "person"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "64b79562-04ca-4d6d-a0a4-23b0bd7e968b",
                  "type": FieldMetadataType.Relation,
                  "name": "noteTargets",
                  "label": "Notes",
                  "description": "Notes tied to the contact",
                  "icon": "IconNotes",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "ee0b4558-79da-49a3-8f73-e759cf618989",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "1c05dac8-29f7-4f1e-9f61-579ad0eb647d",
                      "nameSingular": "person",
                      "namePlural": "people"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "64b79562-04ca-4d6d-a0a4-23b0bd7e968b",
                      "name": "noteTargets"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "01d676a5-d7e9-4d21-98a4-fbaccfa7ffdf",
                      "nameSingular": "noteTarget",
                      "namePlural": "noteTargets"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "6aa53abb-3d35-4f5d-9e8e-f9433488755b",
                      "name": "person"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "8071ecc9-9d3a-4055-8b70-04cd87111471",
                  "type": FieldMetadataType.MultiSelect,
                  "name": "workPreference",
                  "label": "Work Preference",
                  "description": "Person's Work Preference",
                  "icon": "IconHome",
                  "isCustom": true,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:28.368Z",
                  "updatedAt": "2024-10-30T13:39:28.368Z",
                  "defaultValue": null,
                  "options": [
                    {
                      "id": "a96ded4d-cd28-49ba-9a12-448a49670b82",
                      "color": "green",
                      "label": "On-Site",
                      "value": "ON_SITE",
                      "position": 0
                    },
                    {
                      "id": "e5a99d1e-8d3d-4f29-9410-8761d7d93cd7",
                      "color": "turquoise",
                      "label": "Hybrid",
                      "value": "HYBRID",
                      "position": 1
                    },
                    {
                      "id": "80d47bf2-ad5d-4075-b362-e96f257560ee",
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
                  "id": "6c91c44b-5f40-43d2-9669-d7090ff6e4be",
                  "type": FieldMetadataType.Phones,
                  "name": "phones",
                  "label": "Phones",
                  "description": "Contact’s phone numbers",
                  "icon": "IconPhone",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "bded282a-1a30-44d2-bb0b-18880fa76cfe",
                  "type": FieldMetadataType.Rating,
                  "name": "performanceRating",
                  "label": "Performance Rating",
                  "description": "Person's Performance Rating",
                  "icon": "IconStars",
                  "isCustom": true,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:29.279Z",
                  "updatedAt": "2024-10-30T13:39:29.279Z",
                  "defaultValue": null,
                  "options": [
                    {
                      "id": "d83c7e81-5d89-42ba-8f44-48606abd94d8",
                      "label": "1",
                      "value": "RATING_1",
                      "position": 0
                    },
                    {
                      "id": "d22a9aad-0dee-4590-844c-306fb724b0d5",
                      "label": "2",
                      "value": "RATING_2",
                      "position": 1
                    },
                    {
                      "id": "e6707d09-b7c7-49a8-9dac-29e053cb4f99",
                      "label": "3",
                      "value": "RATING_3",
                      "position": 2
                    },
                    {
                      "id": "dc4271d5-7c95-4241-b6a9-4f9f82120ea4",
                      "label": "4",
                      "value": "RATING_4",
                      "position": 3
                    },
                    {
                      "id": "c6969c1e-a01f-4998-ba97-0ea5b6679df8",
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
                  "id": "b351539f-6af9-45bf-9ee3-371368b83022",
                  "type": FieldMetadataType.FullName,
                  "name": "name",
                  "label": "Name",
                  "description": "Contact’s name",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "9dfe9d4a-7603-4425-83b4-47001c858acd",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "28820c91-7931-4ae6-bb28-5b34d821291a",
                  "type": FieldMetadataType.Uuid,
                  "name": "companyId",
                  "label": "Company id (foreign key)",
                  "description": "Contact’s company id foreign key",
                  "icon": "IconBuildingSkyscraper",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "0178953f-ed7e-4fb5-ad60-c9d7c7d1366c",
                  "type": FieldMetadataType.Text,
                  "name": "city",
                  "label": "City",
                  "description": "Contact’s city",
                  "icon": "IconMap",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "1c26cb01-5cee-41cd-8b50-839433bc5c1b",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "92c6a02e-dc42-48a1-8887-7f1583545830",
                  "type": FieldMetadataType.Text,
                  "name": "jobTitle",
                  "label": "Job Title",
                  "description": "Contact’s job title",
                  "icon": "IconBriefcase",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "1acb6467-fce0-4822-9b5e-9529c7e71ccd",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_6a862a788ac6ce967afa06df812",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "3a5181df-47d7-4926-8e40-8bb84018e266",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "1c26cb01-5cee-41cd-8b50-839433bc5c1b"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "4b4f43b5-c044-48c4-886a-aa71bbbf1755",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "28820c91-7931-4ae6-bb28-5b34d821291a"
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
                  "id": "6f6704c3-7838-4e50-ac81-39170d4f037f",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_bbd7aec1976fc684a0a5e4816c9",
                  "indexWhereClause": null,
                  "indexType": IndexType.Gin,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "5770e393-3bcd-45de-8d66-0d0f625b9448",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "32a8f4c6-c106-4071-ae5f-03f847a114f9"
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
                  "id": "d6a3d879-e4f8-428f-a7db-6844ff40f022",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_UNIQUE_87914cd3ce963115f8cb943e2ac",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": true,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "b354b54a-7f79-4dc3-9893-7c81a181e123",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "a779e00c-68fe-4d04-a364-45e3b7c0d2b5"
                        }
                      }
                    ]
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
          "id": "1b8027e7-e77e-43a9-8b99-ae672f0c2d96",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "7e109c72-f99d-4e09-a507-8c8175aee2bf",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "56765ee9-d7b8-448d-9f25-0c4b1fafc41e",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "602aae4d-9f7b-4476-a5b0-d3cf738eae11",
                  "type": FieldMetadataType.Select,
                  "name": "logicalOperator",
                  "label": "Logical Operator",
                  "description": "Logical operator for the filter group",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "'NOT'",
                  "options": [
                    {
                      "id": "813c7a51-1e06-49b2-9529-f38a01513061",
                      "color": "blue",
                      "label": "AND",
                      "value": "AND",
                      "position": 0
                    },
                    {
                      "id": "b985fed1-ddbd-400a-be56-f770de51af03",
                      "color": "green",
                      "label": "OR",
                      "value": "OR",
                      "position": 1
                    },
                    {
                      "id": "c960381d-a829-4531-b48e-6808aa51f3a8",
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
                  "id": "5fd33d47-cb5b-4c9d-a05e-e48e89541196",
                  "type": FieldMetadataType.Relation,
                  "name": "view",
                  "label": "View",
                  "description": "View",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "a7eb655c-ce3b-440f-8e8c-53e0f621da61",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "1b8027e7-e77e-43a9-8b99-ae672f0c2d96",
                      "nameSingular": "viewFilterGroup",
                      "namePlural": "viewFilterGroups"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "5fd33d47-cb5b-4c9d-a05e-e48e89541196",
                      "name": "view"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "88520ce4-938b-4d9f-a5ea-61e5e89f767e",
                      "nameSingular": "view",
                      "namePlural": "views"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "ad547e8a-8363-4834-ae26-5e5c9e92f280",
                      "name": "viewFilterGroups"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "0f536f18-0d0a-4d3c-ba49-70b1be5be3fe",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "41302538-a120-42e7-9274-98ccc7bb0c40",
                  "type": FieldMetadataType.Uuid,
                  "name": "viewId",
                  "label": "View id (foreign key)",
                  "description": "View id foreign key",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "ed00f540-e5f5-4858-86c9-270de3ecd87b",
                  "type": FieldMetadataType.Position,
                  "name": "positionInViewFilterGroup",
                  "label": "Position in view filter group",
                  "description": "Position in the parent view filter group",
                  "icon": "IconHierarchy2",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "59f23864-7aca-431c-874b-38192110e9ee",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "7e109c72-f99d-4e09-a507-8c8175aee2bf",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "271ec5cd-f5e8-4c9b-b9c5-70cd24a9ba7d",
                  "type": FieldMetadataType.Uuid,
                  "name": "parentViewFilterGroupId",
                  "label": "Parent View Filter Group Id",
                  "description": "Parent View Filter Group",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "1d8a5a60-8514-45c5-9eb3-f4ef6c8c0efb",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_64ce6940a9464cd62484d52fb08",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "1f532999-ecc0-4385-a6a7-e7da4948abc5",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "0f536f18-0d0a-4d3c-ba49-70b1be5be3fe"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "8edc9c24-d2ec-493a-827d-5d6b44b2d52d",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "41302538-a120-42e7-9274-98ccc7bb0c40"
                        }
                      }
                    ]
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
          "id": "18c81dd7-1656-4cfd-930c-40917a8ebdb1",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "7a02a84d-fdfc-4225-8663-a596f70b4906",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "05581434-a49c-4f9a-a9a1-d2c34d9d2833",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "772b40e9-7b6a-4f6f-80dd-364d2b684bea",
                  "type": FieldMetadataType.Text,
                  "name": "displayValue",
                  "label": "Display Value",
                  "description": "View Filter Display Value",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "38cc2789-fd24-4eae-a658-13e4262891a9",
                  "type": FieldMetadataType.Text,
                  "name": "operand",
                  "label": "Operand",
                  "description": "View Filter operand",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "77e3ad77-5c63-44a0-bebc-c29b332ccf1e",
                  "type": FieldMetadataType.Uuid,
                  "name": "viewId",
                  "label": "View id (foreign key)",
                  "description": "View Filter related view id foreign key",
                  "icon": "IconLayoutCollage",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "0c12b165-4297-4e28-842d-f0c7fc10b4ec",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "e4f07ee0-007e-421f-a8d1-81efc4469c4d",
                  "type": FieldMetadataType.Position,
                  "name": "positionInViewFilterGroup",
                  "label": "Position in view filter group",
                  "description": "Position in the view filter group",
                  "icon": "IconHierarchy2",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "7a02a84d-fdfc-4225-8663-a596f70b4906",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "07806fe5-7b74-4c75-b6b9-b31ed34201f8",
                  "type": FieldMetadataType.Relation,
                  "name": "view",
                  "label": "View",
                  "description": "View Filter related view",
                  "icon": "IconLayoutCollage",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "62a743f6-0984-4b49-8e60-1845853db297",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "18c81dd7-1656-4cfd-930c-40917a8ebdb1",
                      "nameSingular": "viewFilter",
                      "namePlural": "viewFilters"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "07806fe5-7b74-4c75-b6b9-b31ed34201f8",
                      "name": "view"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "88520ce4-938b-4d9f-a5ea-61e5e89f767e",
                      "nameSingular": "view",
                      "namePlural": "views"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "72a66df5-81b7-4b38-bc1c-c637b890c9f0",
                      "name": "viewFilters"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "ddd29525-3798-4994-babe-4a9a60f21cc7",
                  "type": FieldMetadataType.Uuid,
                  "name": "fieldMetadataId",
                  "label": "Field Metadata Id",
                  "description": "View Filter target field",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "88657060-cd27-4340-ab9b-421c297fbac4",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "fa342b82-4f3e-420e-a967-208796d092ef",
                  "type": FieldMetadataType.Text,
                  "name": "value",
                  "label": "Value",
                  "description": "View Filter value",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "17ea0485-fb34-4a9f-a242-7500a7be9b38",
                  "type": FieldMetadataType.Uuid,
                  "name": "viewFilterGroupId",
                  "label": "View Filter Group Id",
                  "description": "View Filter Group",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "a13146ca-02db-43d3-9730-7cd188936bd3",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_5653b106ee9a9e3d5c1c790419a",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "861c791b-1d20-46bc-8ae3-dd5324c0a344",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "77e3ad77-5c63-44a0-bebc-c29b332ccf1e"
                        }
                      }
                    ]
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
          "id": "082301c2-cd4d-4cdf-ab5a-98a71d493036",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
          "nameSingular": "timelineActivity",
          "namePlural": "timelineActivities",
          "labelSingular": "Timeline Activity",
          "labelPlural": "Timeline Activities",
          "description": "Aggregated / filtered event to be displayed on the timeline",
          "icon": "IconTimelineEvent",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "2fcdbbf9-b1c8-4073-b546-bbf5de9350dc",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "2fcdbbf9-b1c8-4073-b546-bbf5de9350dc",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "e84f32ae-f82c-44e0-a772-3e1e9a5ca5e6",
                  "type": FieldMetadataType.Uuid,
                  "name": "rocketId",
                  "label": "Rocket ID (foreign key)",
                  "description": "Timeline Activity Rocket id foreign key",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:30.550Z",
                  "updatedAt": "2024-10-30T13:39:30.550Z",
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
                  "id": "971d7e6e-8ac5-45ee-8e8b-2fe38f3ee305",
                  "type": FieldMetadataType.Relation,
                  "name": "workflowVersion",
                  "label": "WorkflowVersion",
                  "description": "Event workflow version",
                  "icon": "IconTargetArrow",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "db8b3588-fc2e-4809-83da-585d5a7c7b94",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "082301c2-cd4d-4cdf-ab5a-98a71d493036",
                      "nameSingular": "timelineActivity",
                      "namePlural": "timelineActivities"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "971d7e6e-8ac5-45ee-8e8b-2fe38f3ee305",
                      "name": "workflowVersion"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "fad28eb7-a085-4917-93b3-579afd54f373",
                      "nameSingular": "workflowVersion",
                      "namePlural": "workflowVersions"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "982e771e-36b5-43d7-8311-9e0147413c37",
                      "name": "timelineActivities"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "014bb754-66d6-4272-b898-b56d213088cd",
                  "type": FieldMetadataType.RawJson,
                  "name": "properties",
                  "label": "Event details",
                  "description": "Json value for event details",
                  "icon": "IconListDetails",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "11786990-63a1-4cfb-81d4-dd3f7ff4bb5e",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "22a41f8a-7e01-4c99-a404-7803a7fd55c1",
                  "type": FieldMetadataType.Uuid,
                  "name": "workspaceMemberId",
                  "label": "Workspace Member id (foreign key)",
                  "description": "Event workspace member id foreign key",
                  "icon": "IconCircleUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "f14e780d-4784-4aa0-a9fe-a0e3de90881b",
                  "type": FieldMetadataType.Text,
                  "name": "linkedRecordCachedName",
                  "label": "Linked Record cached name",
                  "description": "Cached record name",
                  "icon": "IconAbc",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "e694cbc5-0f5b-4f5b-b2e6-27d5d2bb6d83",
                  "type": FieldMetadataType.Uuid,
                  "name": "workflowVersionId",
                  "label": "WorkflowVersion id (foreign key)",
                  "description": "Event workflow version id foreign key",
                  "icon": "IconTargetArrow",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "f1192a47-f65e-4670-a264-76b6a0554196",
                  "type": FieldMetadataType.Uuid,
                  "name": "opportunityId",
                  "label": "Opportunity id (foreign key)",
                  "description": "Event opportunity id foreign key",
                  "icon": "IconTargetArrow",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "1f63eefe-6157-4604-a1b5-b5f4a751739f",
                  "type": FieldMetadataType.Uuid,
                  "name": "taskId",
                  "label": "Task id (foreign key)",
                  "description": "Event task id foreign key",
                  "icon": "IconTargetArrow",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "7b3381dc-10f3-451b-b948-292d17326438",
                  "type": FieldMetadataType.Text,
                  "name": "name",
                  "label": "Event name",
                  "description": "Event name",
                  "icon": "IconAbc",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "aac285c9-3c46-4bd2-b110-047a7d21ad13",
                  "type": FieldMetadataType.Relation,
                  "name": "workflow",
                  "label": "Workflow",
                  "description": "Event workflow",
                  "icon": "IconTargetArrow",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "143ea000-9a6f-4f1d-8c19-38f1c05ce3a7",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "082301c2-cd4d-4cdf-ab5a-98a71d493036",
                      "nameSingular": "timelineActivity",
                      "namePlural": "timelineActivities"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "aac285c9-3c46-4bd2-b110-047a7d21ad13",
                      "name": "workflow"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "8ee31473-4b30-4870-bcaa-92d77ad56bb6",
                      "nameSingular": "workflow",
                      "namePlural": "workflows"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "e5fa8aec-caf5-4334-8c39-d8f3eebfaabe",
                      "name": "timelineActivities"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "738e965d-814a-4ab4-a66c-21ae2bb9ad35",
                  "type": FieldMetadataType.Relation,
                  "name": "task",
                  "label": "Task",
                  "description": "Event task",
                  "icon": "IconTargetArrow",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "44687a34-fc9d-47aa-8559-acdd7580e81e",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "082301c2-cd4d-4cdf-ab5a-98a71d493036",
                      "nameSingular": "timelineActivity",
                      "namePlural": "timelineActivities"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "738e965d-814a-4ab4-a66c-21ae2bb9ad35",
                      "name": "task"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "25e10253-f0e1-4a6d-90e3-ad62a4b20292",
                      "nameSingular": "task",
                      "namePlural": "tasks"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "56c91566-aa07-429a-804c-e1e9264d2312",
                      "name": "timelineActivities"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "7ae68305-c320-4d80-b2aa-cb8c9e3755a0",
                  "type": FieldMetadataType.Uuid,
                  "name": "noteId",
                  "label": "Note id (foreign key)",
                  "description": "Event note id foreign key",
                  "icon": "IconTargetArrow",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "afaa48c5-7c8b-47a9-bb6c-ad22d31bbb8e",
                  "type": FieldMetadataType.DateTime,
                  "name": "happensAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "2c7b281d-7829-433d-a441-c3a4d2e0a90f",
                  "type": FieldMetadataType.Uuid,
                  "name": "linkedObjectMetadataId",
                  "label": "Linked Object Metadata Id",
                  "description": "inked Object Metadata Id",
                  "icon": "IconAbc",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "6bf9c134-dd47-4413-8d50-b8e64ae91492",
                  "type": FieldMetadataType.Uuid,
                  "name": "companyId",
                  "label": "Company id (foreign key)",
                  "description": "Event company id foreign key",
                  "icon": "IconBuildingSkyscraper",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "4f44f484-ed6b-4705-9276-ecb96f6dbd7a",
                  "type": FieldMetadataType.Uuid,
                  "name": "linkedRecordId",
                  "label": "Linked Record id",
                  "description": "Linked Record id",
                  "icon": "IconAbc",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "da52ab08-cd76-47d3-b333-c25755c023af",
                  "type": FieldMetadataType.Relation,
                  "name": "note",
                  "label": "Note",
                  "description": "Event note",
                  "icon": "IconTargetArrow",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "45d55e26-edac-4743-b536-8ae8d5af12cb",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "082301c2-cd4d-4cdf-ab5a-98a71d493036",
                      "nameSingular": "timelineActivity",
                      "namePlural": "timelineActivities"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "da52ab08-cd76-47d3-b333-c25755c023af",
                      "name": "note"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "7adf354a-c57f-4c76-8079-259f237dc5da",
                      "nameSingular": "note",
                      "namePlural": "notes"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "fa51d8f4-4a2e-4709-9e3c-ecb3b2602c18",
                      "name": "timelineActivities"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "0a7b67cf-5f49-4873-a617-6c6ccd47dd39",
                  "type": FieldMetadataType.Relation,
                  "name": "workspaceMember",
                  "label": "Workspace Member",
                  "description": "Event workspace member",
                  "icon": "IconCircleUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "85f3aac1-28c3-4e62-b1b8-1e4741b13285",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "082301c2-cd4d-4cdf-ab5a-98a71d493036",
                      "nameSingular": "timelineActivity",
                      "namePlural": "timelineActivities"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "0a7b67cf-5f49-4873-a617-6c6ccd47dd39",
                      "name": "workspaceMember"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "a6ae81d6-b50b-4183-a2bb-ebcc0428dd53",
                      "nameSingular": "workspaceMember",
                      "namePlural": "workspaceMembers"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "dff91df5-36ed-421f-ae00-280e9f7ac50d",
                      "name": "timelineActivities"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "6cdf76c3-3dfa-4612-a730-73e208cadee4",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "b3a935ca-5797-4bfb-b783-cd7b7725e330",
                  "type": FieldMetadataType.Relation,
                  "name": "workflowRun",
                  "label": "Workflow Run",
                  "description": "Event workflow run",
                  "icon": "IconTargetArrow",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "c94de946-5251-4f3e-ac9e-02b3df402610",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "082301c2-cd4d-4cdf-ab5a-98a71d493036",
                      "nameSingular": "timelineActivity",
                      "namePlural": "timelineActivities"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "b3a935ca-5797-4bfb-b783-cd7b7725e330",
                      "name": "workflowRun"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "87ef9245-2665-45db-8193-b6d216b5df50",
                      "nameSingular": "workflowRun",
                      "namePlural": "workflowRuns"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "47274092-c29c-4717-b7b0-2de1a1007beb",
                      "name": "timelineActivities"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "8e0c042c-64a9-4d82-9800-c58b093eda5a",
                  "type": FieldMetadataType.Relation,
                  "name": "person",
                  "label": "Person",
                  "description": "Event person",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "8bf3b5fc-d140-43fb-bbf4-1983fd6ece66",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "082301c2-cd4d-4cdf-ab5a-98a71d493036",
                      "nameSingular": "timelineActivity",
                      "namePlural": "timelineActivities"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "8e0c042c-64a9-4d82-9800-c58b093eda5a",
                      "name": "person"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "1c05dac8-29f7-4f1e-9f61-579ad0eb647d",
                      "nameSingular": "person",
                      "namePlural": "people"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "e847601f-dcaf-45f1-a7a1-5530742ef765",
                      "name": "timelineActivities"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "1b615e84-dd01-4676-adba-8f2b6721a772",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "8e8d68bb-1010-43e3-811f-ec4c53d9d69f",
                  "type": FieldMetadataType.Uuid,
                  "name": "personId",
                  "label": "Person id (foreign key)",
                  "description": "Event person id foreign key",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "9febbd65-1690-4221-90d4-0da74f755899",
                  "type": FieldMetadataType.Relation,
                  "name": "company",
                  "label": "Company",
                  "description": "Event company",
                  "icon": "IconBuildingSkyscraper",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "267d91a0-27bf-4da8-a453-37b80e9553ab",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "082301c2-cd4d-4cdf-ab5a-98a71d493036",
                      "nameSingular": "timelineActivity",
                      "namePlural": "timelineActivities"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "9febbd65-1690-4221-90d4-0da74f755899",
                      "name": "company"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "af4e5bad-fa25-46ab-b32e-1147b5210107",
                      "nameSingular": "company",
                      "namePlural": "companies"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "fd40372d-0805-4d54-a848-45b35c5ec4c7",
                      "name": "timelineActivities"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "746f850a-4f72-41fc-b92b-eb3d1dba3c00",
                  "type": FieldMetadataType.Relation,
                  "name": "rocket",
                  "label": "Rocket",
                  "description": "TimelineActivity Rocket",
                  "icon": "IconBuildingSkyscraper",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:30.641Z",
                  "updatedAt": "2024-10-30T13:39:30.641Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "c0322ad7-03e8-456c-85f5-a9f1726ca85a",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "082301c2-cd4d-4cdf-ab5a-98a71d493036",
                      "nameSingular": "timelineActivity",
                      "namePlural": "timelineActivities"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "746f850a-4f72-41fc-b92b-eb3d1dba3c00",
                      "name": "rocket"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "413848a7-bd94-4c24-aadc-0a5afe7a781f",
                      "nameSingular": "rocket",
                      "namePlural": "rockets"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "6a01f496-cb3a-4216-81a7-a74a9a654e74",
                      "name": "timelineActivities"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "58e1f883-6785-413a-aa88-af2b964971fc",
                  "type": FieldMetadataType.Uuid,
                  "name": "workflowId",
                  "label": "Workflow id (foreign key)",
                  "description": "Event workflow id foreign key",
                  "icon": "IconTargetArrow",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "f37b50e4-f967-4d98-8bd4-36ed00aac809",
                  "type": FieldMetadataType.Uuid,
                  "name": "workflowRunId",
                  "label": "Workflow Run id (foreign key)",
                  "description": "Event workflow run id foreign key",
                  "icon": "IconTargetArrow",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "5607d2b7-1027-42d2-9362-4b51d473758a",
                  "type": FieldMetadataType.Relation,
                  "name": "opportunity",
                  "label": "Opportunity",
                  "description": "Event opportunity",
                  "icon": "IconTargetArrow",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "1f45c275-bc77-4469-b180-2be3916b6f08",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "082301c2-cd4d-4cdf-ab5a-98a71d493036",
                      "nameSingular": "timelineActivity",
                      "namePlural": "timelineActivities"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "5607d2b7-1027-42d2-9362-4b51d473758a",
                      "name": "opportunity"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "e85877ca-dc73-4b9e-b9b7-139dc06ca7b7",
                      "nameSingular": "opportunity",
                      "namePlural": "opportunities"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "a532ecf7-6e9c-4980-8f2c-9b8b37f4f1ce",
                      "name": "timelineActivities"
                    }
                  }
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "842bc86b-c5d6-4652-84e1-3da827fa5fb1",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_a930d316a6b4f3b81d3f026dd16",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "bb550cb7-c80a-4ce6-a557-df0b8f4dfa85",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "22a41f8a-7e01-4c99-a404-7803a7fd55c1"
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
                  "id": "67d85057-ecb1-4b77-a99e-8128b66de710",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_2708a99873421942c99ab94da12",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "13fa5538-497f-41c1-9a86-c71a3efa456e",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "58e1f883-6785-413a-aa88-af2b964971fc"
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
                  "id": "79489888-9586-4002-b90c-3b1c8b613768",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_daf6592d1dff4cff3401bf23c67",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "71a881af-076c-4c91-89e9-dd55e2f0fa2c",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "8e8d68bb-1010-43e3-811f-ec4c53d9d69f"
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
                  "id": "b9ddbfa2-0008-4be1-8af9-984dfc2523dc",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_a98bc2277b52c6dd52303e52c21",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "cd089015-3c73-46b5-a907-08e0b3fa6387",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "7ae68305-c320-4d80-b2aa-cb8c9e3755a0"
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
                  "id": "7febd47c-126b-45bb-8089-dec492776179",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_7e0d952730f13369e3bd9c2f1a9",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "edd36f45-e43e-4899-af83-8db3b09a09cb",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "6cdf76c3-3dfa-4612-a730-73e208cadee4"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "0aa705b9-1f30-413c-83f7-2bf79fedb7cd",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "f1192a47-f65e-4670-a264-76b6a0554196"
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
                  "id": "ccdda6fc-5aca-4fc3-93e0-edc95490f2aa",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_b292fe34a9e2d55884febd07e93",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "7224aca9-5eac-4cf1-b012-2304775a1455",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "6cdf76c3-3dfa-4612-a730-73e208cadee4"
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
                  "id": "3213df12-79e7-4a1a-9eb2-4100a5674387",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_84b1e01cb0480e514a6e7ec0095",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "36d9c7c3-cb55-4944-9fef-db209341d06f",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "6cdf76c3-3dfa-4612-a730-73e208cadee4"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "f45e2806-4719-4f5f-a340-deca73d0b8ca",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "6bf9c134-dd47-4413-8d50-b8e64ae91492"
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
                  "id": "fe240ae4-24c2-48d2-b821-de1d2cdc170d",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_6eae0c4202a87f812adf2f2ba6f",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "dfb74762-2d9e-4567-bac1-6548be07cb42",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "f37b50e4-f967-4d98-8bd4-36ed00aac809"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "b9674605-d84a-49f8-8946-da493a62f7f6",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "6cdf76c3-3dfa-4612-a730-73e208cadee4"
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
                  "id": "8ca84efe-cd2e-4089-b813-7370276a9d33",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_4e40a441ad75df16dd71499529a",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "3155ebd6-bc7f-4e69-8c21-f70dbb5bea66",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "e694cbc5-0f5b-4f5b-b2e6-27d5d2bb6d83"
                        }
                      }
                    ]
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
          "id": "024357b0-9d5b-4e68-b8e2-70acf57a9aba",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "f7f30073-d0e6-4109-a267-936f7ee8a88d",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "302460cb-8e4f-4f8e-bf4b-a568b7bc878d",
                  "type": FieldMetadataType.Select,
                  "name": "contactAutoCreationPolicy",
                  "label": "Contact auto creation policy",
                  "description": "Automatically create records for people you participated with in an event.",
                  "icon": "IconUserCircle",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "'AS_PARTICIPANT_AND_ORGANIZER'",
                  "options": [
                    {
                      "id": "39e9606e-e45a-42ad-99c6-3f59b68c52d4",
                      "color": "green",
                      "label": "As Participant and Organizer",
                      "value": "AS_PARTICIPANT_AND_ORGANIZER",
                      "position": 0
                    },
                    {
                      "id": "e7e4359b-1ff9-4dbd-95a8-f433cc6ca63f",
                      "color": "orange",
                      "label": "As Participant",
                      "value": "AS_PARTICIPANT",
                      "position": 1
                    },
                    {
                      "id": "9875053e-ea56-41c3-aaff-1729bc59a8b8",
                      "color": "blue",
                      "label": "As Organizer",
                      "value": "AS_ORGANIZER",
                      "position": 2
                    },
                    {
                      "id": "e855c969-0ce9-49a4-a0c0-955a597f2e3b",
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
                  "id": "ab598d53-5c7e-4423-95a4-6e581de50579",
                  "type": FieldMetadataType.DateTime,
                  "name": "syncedAt",
                  "label": "Last sync date",
                  "description": "Last sync date",
                  "icon": "IconHistory",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "a3b1ccda-79fc-4c6c-9d00-855f5dd380bd",
                  "type": FieldMetadataType.Text,
                  "name": "syncCursor",
                  "label": "Sync Cursor",
                  "description": "Sync Cursor. Used for syncing events from the calendar provider",
                  "icon": "IconReload",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "87a20f4f-7f0e-4950-bbe9-7934c54d97d5",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "15a6d1f0-caf2-4d2a-8143-bee8d381c22a",
                  "type": FieldMetadataType.Number,
                  "name": "throttleFailureCount",
                  "label": "Throttle Failure Count",
                  "description": "Throttle Failure Count",
                  "icon": "IconX",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "1136c4c5-c3e9-4781-98c6-dd1ff27b4590",
                  "type": FieldMetadataType.Select,
                  "name": "syncStage",
                  "label": "Sync stage",
                  "description": "Sync stage",
                  "icon": "IconStatusChange",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "'FULL_CALENDAR_EVENT_LIST_FETCH_PENDING'",
                  "options": [
                    {
                      "id": "55cb428a-af60-4ccc-8773-fb55252b9e24",
                      "color": "blue",
                      "label": "Full calendar event list fetch pending",
                      "value": "FULL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                      "position": 0
                    },
                    {
                      "id": "cd5cc579-1ee7-42fc-a3d8-b8b3f3e473eb",
                      "color": "blue",
                      "label": "Partial calendar event list fetch pending",
                      "value": "PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                      "position": 1
                    },
                    {
                      "id": "73f6afa4-da7d-44b3-b848-cba16f10ed75",
                      "color": "orange",
                      "label": "Calendar event list fetch ongoing",
                      "value": "CALENDAR_EVENT_LIST_FETCH_ONGOING",
                      "position": 2
                    },
                    {
                      "id": "3e06f105-7559-4133-bf87-eb648d134e72",
                      "color": "blue",
                      "label": "Calendar events import pending",
                      "value": "CALENDAR_EVENTS_IMPORT_PENDING",
                      "position": 3
                    },
                    {
                      "id": "7159c6a6-7d92-47ac-9d0e-d0a0853efffc",
                      "color": "orange",
                      "label": "Calendar events import ongoing",
                      "value": "CALENDAR_EVENTS_IMPORT_ONGOING",
                      "position": 4
                    },
                    {
                      "id": "ba6786de-a9ce-45d5-a6f6-8eeb8b4f47a4",
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
                  "id": "63532a81-eedb-4be8-b823-8700b90f93e8",
                  "type": FieldMetadataType.DateTime,
                  "name": "syncStageStartedAt",
                  "label": "Sync stage started at",
                  "description": "Sync stage started at",
                  "icon": "IconHistory",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "76ec5c25-cff7-4a17-8a6f-0cb6b08e7477",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "9f58df6d-c341-42ff-a4d3-1278b617f3c1",
                  "type": FieldMetadataType.Relation,
                  "name": "calendarChannelEventAssociations",
                  "label": "Calendar Channel Event Associations",
                  "description": "Calendar Channel Event Associations",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "9285dd0e-c431-421e-993f-17ddda252c29",
                    "direction": RelationDefinitionType.OneToMany,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "024357b0-9d5b-4e68-b8e2-70acf57a9aba",
                      "nameSingular": "calendarChannel",
                      "namePlural": "calendarChannels"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "9f58df6d-c341-42ff-a4d3-1278b617f3c1",
                      "name": "calendarChannelEventAssociations"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "e9677a5e-ce9b-44e2-840c-c73fc9c64f1e",
                      "nameSingular": "calendarChannelEventAssociation",
                      "namePlural": "calendarChannelEventAssociations"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "4d0f0c12-fca8-4111-ab73-95ba8bc4c404",
                      "name": "calendarChannel"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "f7f30073-d0e6-4109-a267-936f7ee8a88d",
                  "type": FieldMetadataType.Text,
                  "name": "handle",
                  "label": "Handle",
                  "description": "Handle",
                  "icon": "IconAt",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "''",
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "dab21d1a-7936-4ffc-ba15-aaa561ab1e2c",
                  "type": FieldMetadataType.Uuid,
                  "name": "connectedAccountId",
                  "label": "Connected Account id (foreign key)",
                  "description": "Connected Account id foreign key",
                  "icon": "IconUserCircle",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "ca742a11-31e4-43aa-813d-04e83c50e4a5",
                  "type": FieldMetadataType.Relation,
                  "name": "connectedAccount",
                  "label": "Connected Account",
                  "description": "Connected Account",
                  "icon": "IconUserCircle",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "9d18dc97-6d4f-43ad-adc0-2293f25e969c",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "024357b0-9d5b-4e68-b8e2-70acf57a9aba",
                      "nameSingular": "calendarChannel",
                      "namePlural": "calendarChannels"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "ca742a11-31e4-43aa-813d-04e83c50e4a5",
                      "name": "connectedAccount"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "5c1e17cb-3ed9-4024-b427-fe576d6ce3d1",
                      "nameSingular": "connectedAccount",
                      "namePlural": "connectedAccounts"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "664c36e8-7d1f-4077-9f2c-3d65d0d219cf",
                      "name": "calendarChannels"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "1724f996-164e-4c58-9966-058ee3ba8487",
                  "type": FieldMetadataType.Boolean,
                  "name": "isContactAutoCreationEnabled",
                  "label": "Is Contact Auto Creation Enabled",
                  "description": "Is Contact Auto Creation Enabled",
                  "icon": "IconUserCircle",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "67522df3-bd24-4d37-9a53-9ed71a8b1f76",
                  "type": FieldMetadataType.Boolean,
                  "name": "isSyncEnabled",
                  "label": "Is Sync Enabled",
                  "description": "Is Sync Enabled",
                  "icon": "IconRefresh",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "1664cfbb-6274-4803-9fce-ffd8233f213a",
                  "type": FieldMetadataType.Select,
                  "name": "visibility",
                  "label": "Visibility",
                  "description": "Visibility",
                  "icon": "IconEyeglass",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "'SHARE_EVERYTHING'",
                  "options": [
                    {
                      "id": "30a92cfc-c631-4523-a5df-e00c246752cb",
                      "color": "green",
                      "label": "Metadata",
                      "value": "METADATA",
                      "position": 0
                    },
                    {
                      "id": "6dfe5e9c-1abe-448c-a347-008653a2ad27",
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
                  "id": "8dfd2303-b94d-486f-aad2-e7d298201afd",
                  "type": FieldMetadataType.Select,
                  "name": "syncStatus",
                  "label": "Sync status",
                  "description": "Sync status",
                  "icon": "IconStatusChange",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": [
                    {
                      "id": "6153f65a-7a14-49b1-af65-96abb36e9ea9",
                      "color": "yellow",
                      "label": "Ongoing",
                      "value": "ONGOING",
                      "position": 1
                    },
                    {
                      "id": "f492782f-4d8a-4cb9-b7d3-e2f1c6c98b2c",
                      "color": "blue",
                      "label": "Not Synced",
                      "value": "NOT_SYNCED",
                      "position": 2
                    },
                    {
                      "id": "0858f415-e53c-4fd5-ab49-41afbb883d92",
                      "color": "green",
                      "label": "Active",
                      "value": "ACTIVE",
                      "position": 3
                    },
                    {
                      "id": "daca4b94-d668-43c0-9d0a-731b7a9423fe",
                      "color": "red",
                      "label": "Failed Insufficient Permissions",
                      "value": "FAILED_INSUFFICIENT_PERMISSIONS",
                      "position": 4
                    },
                    {
                      "id": "03e71ffd-ba62-407f-822b-c729aa7af340",
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
                  "id": "defd3073-aeb7-44c0-b1bc-b17087f09e97",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "32fc55a2-9491-4744-b46b-550c5882e31c",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "76c61b01-fc0d-4a14-90ae-099dc7542d88",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_3465c79448bacd2f1268e5f6310",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "d6bb0bf5-cf22-4aab-beb8-f2fe8c91b7ce",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "32fc55a2-9491-4744-b46b-550c5882e31c"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "605a1412-2efc-45f1-b4b1-eda368b55b64",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "dab21d1a-7936-4ffc-ba15-aaa561ab1e2c"
                        }
                      }
                    ]
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
          "id": "01d676a5-d7e9-4d21-98a4-fbaccfa7ffdf",
          "dataSourceId": "190d0ed5-bb8a-4bf2-9bcf-10c373d39ac1",
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
          "createdAt": "2024-10-30T13:38:22.871Z",
          "updatedAt": "2024-10-30T13:38:22.871Z",
          "labelIdentifierFieldMetadataId": "71d023d3-6f34-4b9a-8bb3-8cc24c765a0b",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
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
                  "id": "e0ad90c6-04c4-45d2-af8e-73da4c514279",
                  "type": FieldMetadataType.Relation,
                  "name": "rocket",
                  "label": "Rocket",
                  "description": "NoteTarget Rocket",
                  "icon": "IconBuildingSkyscraper",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:31.219Z",
                  "updatedAt": "2024-10-30T13:39:31.219Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "9a5f9b38-4951-45ee-b126-609794fb16fa",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "01d676a5-d7e9-4d21-98a4-fbaccfa7ffdf",
                      "nameSingular": "noteTarget",
                      "namePlural": "noteTargets"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "e0ad90c6-04c4-45d2-af8e-73da4c514279",
                      "name": "rocket"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "413848a7-bd94-4c24-aadc-0a5afe7a781f",
                      "nameSingular": "rocket",
                      "namePlural": "rockets"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "0d2b7aeb-19a2-451f-9bd6-8a14036840d8",
                      "name": "noteTargets"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "417a9cf3-2bce-450a-87d5-a19691b2b189",
                  "type": FieldMetadataType.Uuid,
                  "name": "companyId",
                  "label": "Company id (foreign key)",
                  "description": "NoteTarget company id foreign key",
                  "icon": "IconBuildingSkyscraper",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "6aa53abb-3d35-4f5d-9e8e-f9433488755b",
                  "type": FieldMetadataType.Relation,
                  "name": "person",
                  "label": "Person",
                  "description": "NoteTarget person",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "ee0b4558-79da-49a3-8f73-e759cf618989",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "01d676a5-d7e9-4d21-98a4-fbaccfa7ffdf",
                      "nameSingular": "noteTarget",
                      "namePlural": "noteTargets"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "6aa53abb-3d35-4f5d-9e8e-f9433488755b",
                      "name": "person"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "1c05dac8-29f7-4f1e-9f61-579ad0eb647d",
                      "nameSingular": "person",
                      "namePlural": "people"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "64b79562-04ca-4d6d-a0a4-23b0bd7e968b",
                      "name": "noteTargets"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "5824337f-a16b-4675-90c5-7564e99f41db",
                  "type": FieldMetadataType.DateTime,
                  "name": "deletedAt",
                  "label": "Deleted at",
                  "description": "Date when the record was deleted",
                  "icon": "IconCalendarMinus",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "6a1cb524-661c-4a0a-8552-edd5ee8c3070",
                  "type": FieldMetadataType.Relation,
                  "name": "opportunity",
                  "label": "Opportunity",
                  "description": "NoteTarget opportunity",
                  "icon": "IconTargetArrow",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "a1922bea-dc39-46ce-9237-3d969a82897e",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "01d676a5-d7e9-4d21-98a4-fbaccfa7ffdf",
                      "nameSingular": "noteTarget",
                      "namePlural": "noteTargets"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "6a1cb524-661c-4a0a-8552-edd5ee8c3070",
                      "name": "opportunity"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "e85877ca-dc73-4b9e-b9b7-139dc06ca7b7",
                      "nameSingular": "opportunity",
                      "namePlural": "opportunities"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "13cc2ff2-c423-4502-8ea3-d7679b86bcd0",
                      "name": "noteTargets"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "5461b3f4-2c08-4edb-bd74-5cb7c3450526",
                  "type": FieldMetadataType.DateTime,
                  "name": "createdAt",
                  "label": "Creation date",
                  "description": "Creation date",
                  "icon": "IconCalendar",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "4ad4bc29-ed67-4ae3-b483-800ac3a7807c",
                  "type": FieldMetadataType.Uuid,
                  "name": "noteId",
                  "label": "Note id (foreign key)",
                  "description": "NoteTarget note id foreign key",
                  "icon": "IconNotes",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "04e4ad6b-cdaf-405d-98b1-2acb0a454c44",
                  "type": FieldMetadataType.Relation,
                  "name": "note",
                  "label": "Note",
                  "description": "NoteTarget note",
                  "icon": "IconNotes",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "8b541da0-5092-4089-9f1f-9504e680c396",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "01d676a5-d7e9-4d21-98a4-fbaccfa7ffdf",
                      "nameSingular": "noteTarget",
                      "namePlural": "noteTargets"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "04e4ad6b-cdaf-405d-98b1-2acb0a454c44",
                      "name": "note"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "7adf354a-c57f-4c76-8079-259f237dc5da",
                      "nameSingular": "note",
                      "namePlural": "notes"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "6bd180be-5c43-4b65-9fa1-255b236ec49e",
                      "name": "noteTargets"
                    }
                  }
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "af6e25ce-9017-4330-a354-700a94649333",
                  "type": FieldMetadataType.Uuid,
                  "name": "personId",
                  "label": "Person id (foreign key)",
                  "description": "NoteTarget person id foreign key",
                  "icon": "IconUser",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "4c8b5791-83a9-4076-8c2d-b05f1ad50f0a",
                  "type": FieldMetadataType.Uuid,
                  "name": "opportunityId",
                  "label": "Opportunity id (foreign key)",
                  "description": "NoteTarget opportunity id foreign key",
                  "icon": "IconTargetArrow",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "68f56972-a901-43f4-b3a0-f85393af1edf",
                  "type": FieldMetadataType.Uuid,
                  "name": "rocketId",
                  "label": "Rocket ID (foreign key)",
                  "description": "Note Target Rocket id foreign key",
                  "icon": null,
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:39:30.965Z",
                  "updatedAt": "2024-10-30T13:39:30.965Z",
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
                  "id": "71d023d3-6f34-4b9a-8bb3-8cc24c765a0b",
                  "type": FieldMetadataType.Uuid,
                  "name": "id",
                  "label": "Id",
                  "description": "Id",
                  "icon": "Icon123",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
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
                  "id": "d5dcf52d-b662-49b3-94d3-d435592455c7",
                  "type": FieldMetadataType.DateTime,
                  "name": "updatedAt",
                  "label": "Last update",
                  "description": "Last time the record was changed",
                  "icon": "IconCalendarClock",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": false,
                  "isNullable": false,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": "now",
                  "options": null,
                  "settings": {
                    "displayAsRelativeDate": true
                  },
                  "relationDefinition": null
                }
              },
              {
                "__typename": "fieldEdge",
                "node": {
                  "__typename": "field",
                  "id": "7df89c3c-90bd-40ef-bbc9-289c119f1fd8",
                  "type": FieldMetadataType.Relation,
                  "name": "company",
                  "label": "Company",
                  "description": "NoteTarget company",
                  "icon": "IconBuildingSkyscraper",
                  "isCustom": false,
                  "isActive": true,
                  "isSystem": true,
                  "isNullable": true,
                  "isUnique": false,
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "defaultValue": null,
                  "options": null,
                  "settings": null,
                  "relationDefinition": {
                    "__typename": "RelationDefinition",
                    "relationId": "f7894817-6567-44a9-a006-2eae13eee010",
                    "direction": RelationDefinitionType.ManyToOne,
                    "sourceObjectMetadata": {
                      "__typename": "object",
                      "id": "01d676a5-d7e9-4d21-98a4-fbaccfa7ffdf",
                      "nameSingular": "noteTarget",
                      "namePlural": "noteTargets"
                    },
                    "sourceFieldMetadata": {
                      "__typename": "field",
                      "id": "7df89c3c-90bd-40ef-bbc9-289c119f1fd8",
                      "name": "company"
                    },
                    "targetObjectMetadata": {
                      "__typename": "object",
                      "id": "af4e5bad-fa25-46ab-b32e-1147b5210107",
                      "nameSingular": "company",
                      "namePlural": "companies"
                    },
                    "targetFieldMetadata": {
                      "__typename": "field",
                      "id": "642dedcf-1ba1-45f4-9a66-ca1aa492e075",
                      "name": "noteTargets"
                    }
                  }
                }
              }
            ]
          },
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "indexEdge",
                "node": {
                  "__typename": "index",
                  "id": "6a1b9cc6-3c13-4b19-ba35-bda2641ec283",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_241f0cca089399c8c5954086b8d",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "8a5e3fae-af9c-46cc-a26b-81e1dfa3804b",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "4ad4bc29-ed67-4ae3-b483-800ac3a7807c"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "9b8fac0f-d796-4aca-a542-f95a36b6c8b8",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "5824337f-a16b-4675-90c5-7564e99f41db"
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
                  "id": "1b84752a-6f0e-4b56-8aa0-f8bc6accd4a9",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_68bce49f4de05facd5365a3a797",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "c8f3600f-01af-4cce-aeae-d58e01ad6412",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "417a9cf3-2bce-450a-87d5-a19691b2b189"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "79abb064-6063-4341-bc89-8d6ea263eb54",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "5824337f-a16b-4675-90c5-7564e99f41db"
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
                  "id": "c4f5365a-5a31-4c0d-a4f2-86b0a329e829",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_19ea95ddb39f610f7dcad4c4336",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
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
                  "id": "eb822a12-e85a-4fb8-b1fe-e94ca48ed574",
                  "createdAt": "2024-10-30T13:38:22.871Z",
                  "updatedAt": "2024-10-30T13:38:22.871Z",
                  "name": "IDX_56454973bce16e65ee1ae3d2e40",
                  "indexWhereClause": null,
                  "indexType": IndexType.Btree,
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "0d572369-c62a-474c-8306-2d4c6166ad5c",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 0,
                          "fieldMetadataId": "af6e25ce-9017-4330-a354-700a94649333"
                        }
                      },
                      {
                        "__typename": "indexFieldEdge",
                        "node": {
                          "__typename": "indexField",
                          "id": "9ee76f2b-9592-4fd3-a1c9-3121fd4cb27e",
                          "createdAt": "2024-10-30T13:38:22.871Z",
                          "updatedAt": "2024-10-30T13:38:22.871Z",
                          "order": 1,
                          "fieldMetadataId": "5824337f-a16b-4675-90c5-7564e99f41db"
                        }
                      }
                    ]
                  }
                }
              }
            ]
          }
        }
      }
    ]
  }
} satisfies ObjectMetadataItemsQuery;

