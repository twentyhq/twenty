import { ObjectMetadataItemsQuery } from '~/generated-metadata/graphql';

// This file is not designed to be manually edited.
// It's an extract from the dev seeded environment metadata call
// TODO: automate the generation of this file
// ⚠️ WARNING ⚠️: Be sure to activate the workflow feature flag (IsWorkflowEnabled) before updating that mock.

/* eslint-disable */
// prettier-ignore
export const mockedStandardObjectMetadataQueryResult: ObjectMetadataItemsQuery =
{
  "objects": {
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
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "fed7d356-a8b2-4861-8624-2f48b6358d37",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "workflowVersion",
          "namePlural": "workflowVersions",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": false,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "7682fe97-21d5-4fdb-8c81-28b6fa80ab14",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Workflow Version",
          "labelPlural": "Workflow Versions",
          "description": "A workflow version",
          "icon": "IconVersions",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "7682fe97-21d5-4fdb-8c81-28b6fa80ab14",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Name",
              "description": "The workflow version name",
              "icon": "IconSettingsAutomation"
            },
            {
              "__typename": "Field",
              "id": "d892e88a-b49a-403e-83e9-89b958322f1f",
              "type": "RAW_JSON",
              "name": "trigger",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Version trigger",
              "description": "Json object to provide trigger",
              "icon": "IconSettingsAutomation"
            },
            {
              "__typename": "Field",
              "id": "e24f8ee2-c356-4f21-8139-0b05eadf958a",
              "type": "RAW_JSON",
              "name": "steps",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Version steps",
              "description": "Json object to provide steps",
              "icon": "IconSettingsAutomation"
            },
            {
              "__typename": "Field",
              "id": "36fafad5-d69e-4cab-af49-956edd777541",
              "type": "SELECT",
              "name": "status",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'DRAFT'",
              "options": [
                {
                  "id": "a2b28fd3-0ffc-4b4a-bef5-84cd7ce172a8",
                  "color": "yellow",
                  "label": "Draft",
                  "value": "DRAFT",
                  "position": 0
                },
                {
                  "id": "ae713696-4984-45df-aedb-ed1bf8437e7d",
                  "color": "green",
                  "label": "Active",
                  "value": "ACTIVE",
                  "position": 1
                },
                {
                  "id": "c0edcfeb-59a7-4fc6-b2fd-a07e1068c6c5",
                  "color": "orange",
                  "label": "Deactivated",
                  "value": "DEACTIVATED",
                  "position": 2
                },
                {
                  "id": "3a56600f-fd91-49fb-9c99-482eec3432fc",
                  "color": "gray",
                  "label": "Archived",
                  "value": "ARCHIVED",
                  "position": 3
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Version status",
              "description": "The workflow version status",
              "icon": "IconStatusChange"
            },
            {
              "__typename": "Field",
              "id": "0cb8f623-1c6d-4377-a09e-ff0256a6d66a",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": 0,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Position",
              "description": "Workflow version position",
              "icon": "IconHierarchy2"
            },
            {
              "__typename": "Field",
              "id": "012210ae-cb2c-4b2a-97c2-b7ed02546a92",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "ad9060df-b6f4-4939-ac96-199fd1e77747",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "9a215f96-3956-4d52-be2a-591a4da1961c",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "cfb8b77d-711a-41fc-83dc-83a34f981e39",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "20dc68ab-74e2-4771-8812-a5ffb3aa9151",
              "type": "RELATION",
              "name": "workflow",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "workflowId"
              },
              "isLabelSyncedWithName": false,
              "label": "Workflow",
              "description": "WorkflowVersion workflow",
              "icon": "IconSettingsAutomation",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "fed7d356-a8b2-4861-8624-2f48b6358d37",
                  "nameSingular": "workflowVersion",
                  "namePlural": "workflowVersions"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "9c5ae6bd-a403-4769-a50b-9953e6f5113b",
                  "nameSingular": "workflow",
                  "namePlural": "workflows"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "20dc68ab-74e2-4771-8812-a5ffb3aa9151",
                  "name": "workflow"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "3b45d90f-e121-4b32-a826-7c87cb75a52a",
                  "name": "versions"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "2deb39f3-46fd-4fb4-a00b-caf42f663fdb",
              "type": "RELATION",
              "name": "runs",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Runs",
              "description": "Workflow runs linked to the version.",
              "icon": "IconRun",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "fed7d356-a8b2-4861-8624-2f48b6358d37",
                  "nameSingular": "workflowVersion",
                  "namePlural": "workflowVersions"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "3fe7df0e-03c0-40e9-8242-bb475c9be8fb",
                  "nameSingular": "workflowRun",
                  "namePlural": "workflowRuns"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "2deb39f3-46fd-4fb4-a00b-caf42f663fdb",
                  "name": "runs"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "27ed9d56-ff2a-4b8f-9c42-5f411e2c00c5",
                  "name": "workflowVersion"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "39d672b7-d6ea-415d-a680-eb56b2883a8f",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Favorites",
              "description": "Favorites linked to the workflow version",
              "icon": "IconHeart",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "fed7d356-a8b2-4861-8624-2f48b6358d37",
                  "nameSingular": "workflowVersion",
                  "namePlural": "workflowVersions"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "39d672b7-d6ea-415d-a680-eb56b2883a8f",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "d3b390a4-5e64-44dc-a8b4-4c8e7d3ba7bc",
                  "name": "workflowVersion"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "19a930cf-736a-488d-b56d-9a919a0225fe",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Timeline Activities",
              "description": "Timeline activities linked to the version",
              "icon": "",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "fed7d356-a8b2-4861-8624-2f48b6358d37",
                  "nameSingular": "workflowVersion",
                  "namePlural": "workflowVersions"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "19a930cf-736a-488d-b56d-9a919a0225fe",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "01e9e2ac-d69f-43ac-bfba-7e5c41892f57",
                  "name": "workflowVersion"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "fd87d0db-2975-4a99-b817-0d36a9b12c6e",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "blocklist",
          "namePlural": "blocklists",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "1ebdcda4-3270-4f05-8360-ee1c05539bdf",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Blocklist",
          "labelPlural": "Blocklists",
          "description": "Blocklist",
          "icon": "IconForbid2",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "1ebdcda4-3270-4f05-8360-ee1c05539bdf",
              "type": "TEXT",
              "name": "handle",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Handle",
              "description": "Handle",
              "icon": "IconAt"
            },
            {
              "__typename": "Field",
              "id": "2867e01e-cf05-4a39-8676-e39e500ac5da",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "ca7e76c1-8999-4f82-9673-266c551a3329",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "c89ed940-0d87-4e4c-9d07-23e61be845b2",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "cca01881-a7f0-42ba-817f-115b1de10c16",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "cbe57bf8-ef2e-4b17-bb86-a2a84a4ea78d",
              "type": "RELATION",
              "name": "workspaceMember",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "SET_NULL",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "workspaceMemberId"
              },
              "isLabelSyncedWithName": false,
              "label": "WorkspaceMember",
              "description": "WorkspaceMember",
              "icon": "IconCircleUser",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "fd87d0db-2975-4a99-b817-0d36a9b12c6e",
                  "nameSingular": "blocklist",
                  "namePlural": "blocklists"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "5821980a-4c2e-455c-8bb6-1a1eb0bf2b36",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "cbe57bf8-ef2e-4b17-bb86-a2a84a4ea78d",
                  "name": "workspaceMember"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "0f4f76e5-915a-4c17-b937-88370475ffd4",
                  "name": "blocklist"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "d5a6519c-0d38-4156-9993-8ccb4fb26812",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "calendarEventParticipant",
          "namePlural": "calendarEventParticipants",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "c5573201-24d4-4988-ab00-cb7d898bfa51",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Calendar event participant",
          "labelPlural": "Calendar event participants",
          "description": "Calendar event participants",
          "icon": "IconCalendar",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "c5573201-24d4-4988-ab00-cb7d898bfa51",
              "type": "TEXT",
              "name": "handle",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Handle",
              "description": "Handle",
              "icon": "IconMail"
            },
            {
              "__typename": "Field",
              "id": "a74a82a7-c2ea-45b4-97e2-d5f3916b5138",
              "type": "TEXT",
              "name": "displayName",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Display Name",
              "description": "Display Name",
              "icon": "IconUser"
            },
            {
              "__typename": "Field",
              "id": "52700e89-d10d-44dd-b464-c10acac300ef",
              "type": "BOOLEAN",
              "name": "isOrganizer",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": false,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Is Organizer",
              "description": "Is Organizer",
              "icon": "IconUser"
            },
            {
              "__typename": "Field",
              "id": "672ce22f-6569-4be0-9212-d9a4b1b6b4ed",
              "type": "SELECT",
              "name": "responseStatus",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'NEEDS_ACTION'",
              "options": [
                {
                  "id": "508bca8d-a59e-4bea-80cd-a1cf43e0f4d5",
                  "color": "orange",
                  "label": "Needs Action",
                  "value": "NEEDS_ACTION",
                  "position": 0
                },
                {
                  "id": "856b355b-e0b6-4279-b1e1-ac4cab91c4b5",
                  "color": "red",
                  "label": "Declined",
                  "value": "DECLINED",
                  "position": 1
                },
                {
                  "id": "53b91f48-cf0b-46c4-8f53-74c7faebd3b1",
                  "color": "yellow",
                  "label": "Tentative",
                  "value": "TENTATIVE",
                  "position": 2
                },
                {
                  "id": "551bd9ab-062e-47f9-bc1f-0deb25f3ef0a",
                  "color": "green",
                  "label": "Accepted",
                  "value": "ACCEPTED",
                  "position": 3
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Response Status",
              "description": "Response Status",
              "icon": "IconUser"
            },
            {
              "__typename": "Field",
              "id": "8222b514-5b80-40fc-a732-13feb01798ef",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "d897c76d-4f39-4b20-8e81-d19f3668cdb4",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "41a6891c-325e-466a-8374-1f3f69db900c",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "eba42f1c-2109-41d3-bb9c-a2c6d15049f9",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "642e2c73-3009-4ea7-97bb-e8e0d46b6006",
              "type": "RELATION",
              "name": "calendarEvent",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "calendarEventId"
              },
              "isLabelSyncedWithName": false,
              "label": "Event ID",
              "description": "Event ID",
              "icon": "IconCalendar",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "d5a6519c-0d38-4156-9993-8ccb4fb26812",
                  "nameSingular": "calendarEventParticipant",
                  "namePlural": "calendarEventParticipants"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "adc935a0-5b4f-4dc1-a4c1-6b411c9afaa2",
                  "nameSingular": "calendarEvent",
                  "namePlural": "calendarEvents"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "642e2c73-3009-4ea7-97bb-e8e0d46b6006",
                  "name": "calendarEvent"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "7af69ce0-cb79-4adb-8bdc-169b859398dc",
                  "name": "calendarEventParticipants"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "83c1c8a0-a1a2-4b12-a6a8-4472810c6b7f",
              "type": "RELATION",
              "name": "person",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "SET_NULL",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "personId"
              },
              "isLabelSyncedWithName": false,
              "label": "Person",
              "description": "Person",
              "icon": "IconUser",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "d5a6519c-0d38-4156-9993-8ccb4fb26812",
                  "nameSingular": "calendarEventParticipant",
                  "namePlural": "calendarEventParticipants"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "5926b097-a8a9-4baa-a001-fa7034aad925",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "83c1c8a0-a1a2-4b12-a6a8-4472810c6b7f",
                  "name": "person"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "a8167739-c784-4597-9a6c-e2f42b8649c7",
                  "name": "calendarEventParticipants"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "f7c8bd9a-15b4-4eef-a408-c20fb5d5d7f5",
              "type": "RELATION",
              "name": "workspaceMember",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "SET_NULL",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "workspaceMemberId"
              },
              "isLabelSyncedWithName": false,
              "label": "Workspace Member",
              "description": "Workspace Member",
              "icon": "IconUser",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "d5a6519c-0d38-4156-9993-8ccb4fb26812",
                  "nameSingular": "calendarEventParticipant",
                  "namePlural": "calendarEventParticipants"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "5821980a-4c2e-455c-8bb6-1a1eb0bf2b36",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "f7c8bd9a-15b4-4eef-a408-c20fb5d5d7f5",
                  "name": "workspaceMember"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "a0d7b244-699a-47d9-b3b3-4393a4505285",
                  "name": "calendarEventParticipants"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "d2a824df-b1a7-421b-a1c4-e2488bf580b9",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "pet",
          "namePlural": "pets",
          "isCustom": true,
          "isRemote": false,
          "isActive": true,
          "isSystem": false,
          "createdAt": "2025-06-06T14:43:03.502Z",
          "updatedAt": "2025-06-06T14:43:03.559Z",
          "labelIdentifierFieldMetadataId": "a53a3ab2-57cd-43f7-a393-839d686455ce",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": true,
          "duplicateCriteria": null,
          "labelSingular": "Pet",
          "labelPlural": "Pets",
          "description": null,
          "icon": "IconCat",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "IndexEdge",
                "node": {
                  "__typename": "Index",
                  "id": "b9ee4c7e-1f66-411e-b27c-5b209bb950a8",
                  "createdAt": "2025-06-06T14:43:03.685Z",
                  "updatedAt": "2025-06-06T14:43:03.685Z",
                  "name": "IDX_82c02a6c94da4f260020dfb54b9",
                  "indexWhereClause": null,
                  "indexType": "GIN",
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "IndexFieldEdge",
                        "node": {
                          "__typename": "IndexField",
                          "id": "e4234e85-ba5a-4d7f-b8a0-28f10c0f144e",
                          "createdAt": "2025-06-06T14:43:03.685Z",
                          "updatedAt": "2025-06-06T14:43:03.685Z",
                          "order": 0,
                          "fieldMetadataId": "d43d8f2e-3d42-4058-b42a-bcc472b5ca69"
                        }
                      }
                    ]
                  }
                }
              }
            ]
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "96661489-6495-45e7-9706-77c6884a0000",
              "type": "RELATION",
              "name": "taskTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:03.605Z",
              "updatedAt": "2025-06-06T14:43:03.605Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "TaskTargets",
              "description": "TaskTargets tied to the Pet",
              "icon": "IconCheckbox",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "d2a824df-b1a7-421b-a1c4-e2488bf580b9",
                  "nameSingular": "pet",
                  "namePlural": "pets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4abbd2fa-de1a-4f59-b5dd-3c51023b9003",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "96661489-6495-45e7-9706-77c6884a0000",
                  "name": "taskTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "10f8e22f-7444-4a33-bc33-7f6c98ec68a1",
                  "name": "pet"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "df349cf8-9bd9-44f9-a188-c1834d8fd20c",
              "type": "RELATION",
              "name": "attachments",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:03.593Z",
              "updatedAt": "2025-06-06T14:43:03.593Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Attachments",
              "description": "Attachments tied to the Pet",
              "icon": "IconFileImport",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "d2a824df-b1a7-421b-a1c4-e2488bf580b9",
                  "nameSingular": "pet",
                  "namePlural": "pets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "3001f4f9-fd3e-4403-8f1f-bc8a135e2619",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "df349cf8-9bd9-44f9-a188-c1834d8fd20c",
                  "name": "attachments"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "2eb052e2-b9e8-4e5d-8f36-2aa91ed5a068",
                  "name": "pet"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "2bc4877d-f902-4c12-bbf7-64e525eafee5",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:03.601Z",
              "updatedAt": "2025-06-06T14:43:03.601Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Favorites",
              "description": "Favorites tied to the Pet",
              "icon": "IconHeart",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "d2a824df-b1a7-421b-a1c4-e2488bf580b9",
                  "nameSingular": "pet",
                  "namePlural": "pets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "2bc4877d-f902-4c12-bbf7-64e525eafee5",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "37fbb14b-25ea-45db-80b3-b45407107c90",
                  "name": "pet"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "16635a9f-50ca-4178-a3ac-65bb93ffde7d",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:03.502Z",
              "updatedAt": "2025-06-06T14:43:03.502Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "a53a3ab2-57cd-43f7-a393-839d686455ce",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:03.502Z",
              "updatedAt": "2025-06-06T14:43:03.502Z",
              "defaultValue": "'Untitled'",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Name",
              "description": "Name",
              "icon": "IconAbc"
            },
            {
              "__typename": "Field",
              "id": "f5b1680c-0de5-4bab-9f91-698ab170bd60",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:03.502Z",
              "updatedAt": "2025-06-06T14:43:03.502Z",
              "defaultValue": "now",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "fb866531-3945-4c70-8283-e9a739be4de7",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:03.502Z",
              "updatedAt": "2025-06-06T14:43:03.502Z",
              "defaultValue": "now",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "df5d6957-a5e3-409f-9654-4185e7f2d049",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:03.502Z",
              "updatedAt": "2025-06-06T14:43:03.502Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Deletion date",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "ffa19169-fd38-4766-89fc-3af6eb199d08",
              "type": "ACTOR",
              "name": "createdBy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:03.502Z",
              "updatedAt": "2025-06-06T14:43:03.502Z",
              "defaultValue": {
                "name": "''",
                "source": "'MANUAL'"
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Created by",
              "description": "The creator of the record",
              "icon": "IconCreativeCommonsSa"
            },
            {
              "__typename": "Field",
              "id": "0d58a11a-846c-496e-9564-9796cec062f5",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:03.502Z",
              "updatedAt": "2025-06-06T14:43:03.502Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Position",
              "description": "Position",
              "icon": "IconHierarchy2"
            },
            {
              "__typename": "Field",
              "id": "13506640-485d-41fc-9441-8012732f7ed8",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:03.614Z",
              "updatedAt": "2025-06-06T14:43:03.614Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "TimelineActivities",
              "description": "TimelineActivities tied to the Pet",
              "icon": "IconTimelineEvent",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "d2a824df-b1a7-421b-a1c4-e2488bf580b9",
                  "nameSingular": "pet",
                  "namePlural": "pets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "13506640-485d-41fc-9441-8012732f7ed8",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "153feaf4-66bf-4155-aed9-0e7dc77b9ef1",
                  "name": "pet"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "a110ac78-e338-4082-93bd-7b85f18a0606",
              "type": "RELATION",
              "name": "noteTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:03.602Z",
              "updatedAt": "2025-06-06T14:43:03.602Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "NoteTargets",
              "description": "NoteTargets tied to the Pet",
              "icon": "IconCheckbox",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "d2a824df-b1a7-421b-a1c4-e2488bf580b9",
                  "nameSingular": "pet",
                  "namePlural": "pets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "897567d1-bee8-420d-8734-0a18459ea1d1",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "a110ac78-e338-4082-93bd-7b85f18a0606",
                  "name": "noteTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "2b1524b6-54d6-4199-8718-7dbdf507fd2d",
                  "name": "pet"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "d43d8f2e-3d42-4058-b42a-bcc472b5ca69",
              "type": "TS_VECTOR",
              "name": "searchVector",
              "isCustom": false,
              "isActive": false,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:03.668Z",
              "updatedAt": "2025-06-06T14:43:03.668Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Search vector",
              "description": "Field used for full-text search",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "a12dda38-becf-4512-bd18-8692164283b1",
              "type": "SELECT",
              "name": "species",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:04.775Z",
              "updatedAt": "2025-06-06T14:43:04.775Z",
              "defaultValue": null,
              "options": [
                {
                  "id": "4f3871b3-a935-4a45-86e6-8a4bebe52e1e",
                  "color": "blue",
                  "label": "Dog",
                  "value": "DOG",
                  "position": 0
                },
                {
                  "id": "cf76a26a-1782-4f17-8610-de5b495d579c",
                  "color": "red",
                  "label": "Cat",
                  "value": "CAT",
                  "position": 1
                },
                {
                  "id": "a9fdd573-a5f6-4814-bd5c-7e6ae01b4d57",
                  "color": "green",
                  "label": "Bird",
                  "value": "BIRD",
                  "position": 2
                },
                {
                  "id": "2ca4f385-666c-4125-bad3-055647d9926b",
                  "color": "yellow",
                  "label": "Fish",
                  "value": "FISH",
                  "position": 3
                },
                {
                  "id": "2c86ccd2-7809-45e3-ad6d-f749f1ed6742",
                  "color": "purple",
                  "label": "Rabbit",
                  "value": "RABBIT",
                  "position": 4
                },
                {
                  "id": "cb5d50c8-a668-4e92-adc2-c0457012cc42",
                  "color": "orange",
                  "label": "Hamster",
                  "value": "HAMSTER",
                  "position": 5
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Species",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "9fefd004-391b-4212-a530-64d680f14047",
              "type": "MULTI_SELECT",
              "name": "traits",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:04.779Z",
              "updatedAt": "2025-06-06T14:43:04.779Z",
              "defaultValue": null,
              "options": [
                {
                  "id": "d544e251-7f44-4bfa-afc9-ffb825a08ccf",
                  "color": "blue",
                  "label": "Playful",
                  "value": "PLAYFUL",
                  "position": 0
                },
                {
                  "id": "e4bd05ce-86fc-40f8-a0bb-bf6749d013b3",
                  "color": "red",
                  "label": "Friendly",
                  "value": "FRIENDLY",
                  "position": 1
                },
                {
                  "id": "fb38ca32-a2b8-4e68-97a0-6c43e4be1770",
                  "color": "green",
                  "label": "Protective",
                  "value": "PROTECTIVE",
                  "position": 2
                },
                {
                  "id": "0ae57952-dc7b-4d2d-8289-cc2478e4344f",
                  "color": "yellow",
                  "label": "Shy",
                  "value": "SHY",
                  "position": 3
                },
                {
                  "id": "249c3832-1f8f-41c2-961d-704609869a31",
                  "color": "purple",
                  "label": "Brave",
                  "value": "BRAVE",
                  "position": 4
                },
                {
                  "id": "481cfe35-0a47-4954-8eeb-c1e77b27d237",
                  "color": "orange",
                  "label": "Curious",
                  "value": "CURIOUS",
                  "position": 5
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Traits",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "1b6df5dc-4c21-4555-a268-3d0f2dd1c940",
              "type": "TEXT",
              "name": "comments",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:04.783Z",
              "updatedAt": "2025-06-06T14:43:04.783Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Comments",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "cac62340-f97e-4e45-b1e9-8ee6748447f1",
              "type": "NUMBER",
              "name": "age",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:04.786Z",
              "updatedAt": "2025-06-06T14:43:04.786Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Age",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "f2f28105-ea72-468f-a35b-7cc2076d29d6",
              "type": "ADDRESS",
              "name": "location",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:04.791Z",
              "updatedAt": "2025-06-06T14:43:04.791Z",
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
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Location",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "112c276a-854c-486e-ba70-be891c51734f",
              "type": "PHONES",
              "name": "vetPhone",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:04.795Z",
              "updatedAt": "2025-06-06T14:43:04.795Z",
              "defaultValue": {
                "additionalPhones": null,
                "primaryPhoneNumber": "''",
                "primaryPhoneCallingCode": "''",
                "primaryPhoneCountryCode": "''"
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Vet phone",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "5e153844-5c7c-4db8-b545-cac6c77b1d90",
              "type": "EMAILS",
              "name": "vetEmail",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:04.799Z",
              "updatedAt": "2025-06-06T14:43:04.799Z",
              "defaultValue": {
                "primaryEmail": "''",
                "additionalEmails": null
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Vet email",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "5832e414-5a43-4162-a73e-8292e48d79ee",
              "type": "DATE",
              "name": "birthday",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:04.802Z",
              "updatedAt": "2025-06-06T14:43:04.802Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Birthday",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "1af8ac44-96fc-485a-91ef-51b04f5f4db0",
              "type": "BOOLEAN",
              "name": "isGoodWithKids",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:04.805Z",
              "updatedAt": "2025-06-06T14:43:04.805Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Is good with kids",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "7a92ce36-48cb-40ea-9955-97bb7d97dc0b",
              "type": "LINKS",
              "name": "pictures",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:04.808Z",
              "updatedAt": "2025-06-06T14:43:04.808Z",
              "defaultValue": {
                "primaryLinkUrl": "''",
                "secondaryLinks": "'[]'",
                "primaryLinkLabel": "''"
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Pictures",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "f3a36405-c616-4666-beaf-264cdf521530",
              "type": "CURRENCY",
              "name": "averageCostOfKibblePerMonth",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:04.812Z",
              "updatedAt": "2025-06-06T14:43:04.812Z",
              "defaultValue": {
                "amountMicros": null,
                "currencyCode": "''"
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Average cost of kibble per month",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "c6b03190-7c6a-43ef-bf2f-073d7a49f9d7",
              "type": "FULL_NAME",
              "name": "makesOwnerThinkOf",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:04.816Z",
              "updatedAt": "2025-06-06T14:43:04.816Z",
              "defaultValue": {
                "lastName": "''",
                "firstName": "''"
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Makes its owner think of",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "afdbbfd7-9bb5-4a7c-8435-52fabfa53629",
              "type": "RATING",
              "name": "soundSwag",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:04.819Z",
              "updatedAt": "2025-06-06T14:43:04.819Z",
              "defaultValue": null,
              "options": [
                {
                  "id": "cd8604ea-45c3-4b28-821c-2a166daae5de",
                  "label": "1",
                  "value": "RATING_1",
                  "position": 0
                },
                {
                  "id": "6693ca17-6f36-47fd-88a0-62568e7f7b18",
                  "label": "2",
                  "value": "RATING_2",
                  "position": 1
                },
                {
                  "id": "b65e7de7-75a2-4ecc-8bc7-33bd07448755",
                  "label": "3",
                  "value": "RATING_3",
                  "position": 2
                },
                {
                  "id": "6374f269-728e-4cf1-82e7-13a283c34616",
                  "label": "4",
                  "value": "RATING_4",
                  "position": 3
                },
                {
                  "id": "c8365d33-67f8-421d-bcc8-ff6d37fe83b9",
                  "label": "5",
                  "value": "RATING_5",
                  "position": 4
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Sound swag (bark style, meow style, etc.)",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "1765687e-ee21-4035-b8ff-6daec03988d1",
              "type": "RICH_TEXT",
              "name": "bio",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:04.822Z",
              "updatedAt": "2025-06-06T14:43:04.822Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Bio",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "66abf91a-e4cf-4015-8dc2-626658eae5d5",
              "type": "ARRAY",
              "name": "interestingFacts",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:04.826Z",
              "updatedAt": "2025-06-06T14:43:04.826Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Interesting facts",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "4e619ace-b8e9-4ea4-b464-eb938dde5e98",
              "type": "RAW_JSON",
              "name": "extraData",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:04.830Z",
              "updatedAt": "2025-06-06T14:43:04.830Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Extra data",
              "description": "",
              "icon": ""
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "c11ab49c-a82a-46dd-b1fe-32d1892b6d46",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "viewFilter",
          "namePlural": "viewFilters",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "b684f79c-4deb-41ea-9ad0-9feff527c10a",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "View Filter",
          "labelPlural": "View Filters",
          "description": "(System) View Filters",
          "icon": "IconFilterBolt",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "f630b7a2-0f2d-474f-a747-940f2d94e83d",
              "type": "UUID",
              "name": "fieldMetadataId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Field Metadata Id",
              "description": "View Filter target field",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "279efe7d-962b-40b8-ae38-2c26d925c8b4",
              "type": "TEXT",
              "name": "operand",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'Contains'",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Operand",
              "description": "View Filter operand",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "3804eee4-6f29-4ed0-b3bf-6c8ed995aa96",
              "type": "TEXT",
              "name": "value",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Value",
              "description": "View Filter value",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "3ad14038-0f8c-4489-b468-2e0575a2435d",
              "type": "TEXT",
              "name": "displayValue",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Display Value",
              "description": "View Filter Display Value",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "4a1c8ac4-0e66-404b-86ed-74e73cb2bd55",
              "type": "UUID",
              "name": "viewFilterGroupId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "View Filter Group Id",
              "description": "View Filter Group",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "b915dac6-9f48-4e3c-9b50-433c7541516f",
              "type": "NUMBER",
              "name": "positionInViewFilterGroup",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Position in view filter group",
              "description": "Position in the view filter group",
              "icon": "IconHierarchy2"
            },
            {
              "__typename": "Field",
              "id": "fda7b592-b3d4-4461-9cf6-2e6d9fb460bc",
              "type": "TEXT",
              "name": "subFieldName",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Sub field name",
              "description": "Sub field name",
              "icon": "IconSubtask"
            },
            {
              "__typename": "Field",
              "id": "b684f79c-4deb-41ea-9ad0-9feff527c10a",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "55f87b7b-46dc-4e4f-adc8-e019a9b7d756",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "60cb5f37-e20e-401f-a1f3-9d6ffea825ae",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "f7f9035e-e790-432f-9d94-7310a26e2a8b",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "fcd01ec4-b1c3-47f7-9d8f-b79a1a16ef88",
              "type": "RELATION",
              "name": "view",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "viewId"
              },
              "isLabelSyncedWithName": false,
              "label": "View",
              "description": "View Filter related view",
              "icon": "IconLayoutCollage",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "c11ab49c-a82a-46dd-b1fe-32d1892b6d46",
                  "nameSingular": "viewFilter",
                  "namePlural": "viewFilters"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "93c079c7-1af4-4f0b-970a-cac536005231",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "fcd01ec4-b1c3-47f7-9d8f-b79a1a16ef88",
                  "name": "view"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "5e6da838-eb7c-4b4d-ba17-65354db95c9d",
                  "name": "viewFilters"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "b2c964f4-53ab-4656-bc3b-3d407b1bce7d",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "viewFilterGroup",
          "namePlural": "viewFilterGroups",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "35209b7f-af12-4b7e-b8ac-bdb7bf8f3582",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "View Filter Group",
          "labelPlural": "View Filter Groups",
          "description": "(System) View Filter Groups",
          "icon": "IconFilterBolt",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "7061a48a-8dde-4ec1-989d-e6bf81a85d30",
              "type": "UUID",
              "name": "parentViewFilterGroupId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Parent View Filter Group Id",
              "description": "Parent View Filter Group",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "6ac0a197-e1d9-49f6-881b-5d87b82f9dd7",
              "type": "SELECT",
              "name": "logicalOperator",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'NOT'",
              "options": [
                {
                  "id": "6633ca2e-7fb4-4402-97e2-888ffea2d12e",
                  "color": "blue",
                  "label": "AND",
                  "value": "AND",
                  "position": 0
                },
                {
                  "id": "08bc6c0e-adf7-4d15-b232-8462e2741da3",
                  "color": "green",
                  "label": "OR",
                  "value": "OR",
                  "position": 1
                },
                {
                  "id": "5e5e403f-a7af-40a5-9d1c-baf103649057",
                  "color": "red",
                  "label": "NOT",
                  "value": "NOT",
                  "position": 2
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Logical Operator",
              "description": "Logical operator for the filter group",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "3041f365-c387-4afb-9976-039c4419ef06",
              "type": "NUMBER",
              "name": "positionInViewFilterGroup",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Position in view filter group",
              "description": "Position in the parent view filter group",
              "icon": "IconHierarchy2"
            },
            {
              "__typename": "Field",
              "id": "35209b7f-af12-4b7e-b8ac-bdb7bf8f3582",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "9e7116a1-4dc3-47de-8e61-00d8983629c1",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "1d6e4a68-1063-4201-905b-681cfbe8ad0e",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "d0f8a163-b006-45ea-bb9d-c78d18ab7c79",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "f83e92ce-12dd-4c72-90f6-5095972e3aa2",
              "type": "RELATION",
              "name": "view",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "viewId"
              },
              "isLabelSyncedWithName": false,
              "label": "View",
              "description": "View",
              "icon": "",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "b2c964f4-53ab-4656-bc3b-3d407b1bce7d",
                  "nameSingular": "viewFilterGroup",
                  "namePlural": "viewFilterGroups"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "93c079c7-1af4-4f0b-970a-cac536005231",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "f83e92ce-12dd-4c72-90f6-5095972e3aa2",
                  "name": "view"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "da0d7aef-2609-42ba-a171-1febf458f264",
                  "name": "viewFilterGroups"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "b275aa83-4488-464b-a6e4-b9b641630259",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "connectedAccount",
          "namePlural": "connectedAccounts",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "85db97b6-fc21-4581-b6a2-b35626cac4f7",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Connected Account",
          "labelPlural": "Connected Accounts",
          "description": "A connected account",
          "icon": "IconAt",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "85db97b6-fc21-4581-b6a2-b35626cac4f7",
              "type": "TEXT",
              "name": "handle",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "handle",
              "description": "The account handle (email, username, phone number, etc.)",
              "icon": "IconMail"
            },
            {
              "__typename": "Field",
              "id": "020dafcd-c43c-4efd-bb47-2b8a62a1ab18",
              "type": "TEXT",
              "name": "provider",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "provider",
              "description": "The account provider",
              "icon": "IconSettings"
            },
            {
              "__typename": "Field",
              "id": "706c347a-28ab-4b45-b6b1-a36e588d740c",
              "type": "TEXT",
              "name": "accessToken",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Access Token",
              "description": "Messaging provider access token",
              "icon": "IconKey"
            },
            {
              "__typename": "Field",
              "id": "2c9eb1d0-2dd4-4aaa-92fd-f0f96cea2fe1",
              "type": "TEXT",
              "name": "refreshToken",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Refresh Token",
              "description": "Messaging provider refresh token",
              "icon": "IconKey"
            },
            {
              "__typename": "Field",
              "id": "6d06b2e3-04b6-4df8-9449-ba3083782b6d",
              "type": "TEXT",
              "name": "lastSyncHistoryId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last sync history ID",
              "description": "Last sync history ID",
              "icon": "IconHistory"
            },
            {
              "__typename": "Field",
              "id": "a41336c2-1f39-4b99-a215-368e9e37c410",
              "type": "DATE_TIME",
              "name": "authFailedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Auth failed at",
              "description": "Auth failed at",
              "icon": "IconX"
            },
            {
              "__typename": "Field",
              "id": "196d3f1a-a52b-4b8e-8e24-d83b7ee54731",
              "type": "TEXT",
              "name": "handleAliases",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Handle Aliases",
              "description": "Handle Aliases",
              "icon": "IconMail"
            },
            {
              "__typename": "Field",
              "id": "46ea63ae-0457-4785-836c-14ca1c80ee38",
              "type": "ARRAY",
              "name": "scopes",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Scopes",
              "description": "Scopes",
              "icon": "IconSettings"
            },
            {
              "__typename": "Field",
              "id": "6ae7bfef-49c6-43b4-bc52-f9eb152a2d00",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "f6419360-00c0-4809-a327-20a959da6b45",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "1818b610-65b1-41bd-b4d3-9b3a835e7884",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "e0924f9a-aab3-4b5c-a965-9f3311ea9445",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "b5e74424-be16-47a9-a99e-145d2ee885fa",
              "type": "RELATION",
              "name": "accountOwner",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "accountOwnerId"
              },
              "isLabelSyncedWithName": false,
              "label": "Account Owner",
              "description": "Account Owner",
              "icon": "IconUserCircle",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "b275aa83-4488-464b-a6e4-b9b641630259",
                  "nameSingular": "connectedAccount",
                  "namePlural": "connectedAccounts"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "5821980a-4c2e-455c-8bb6-1a1eb0bf2b36",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "b5e74424-be16-47a9-a99e-145d2ee885fa",
                  "name": "accountOwner"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "6418adc9-0867-467e-8779-2d8aa712e6c8",
                  "name": "connectedAccounts"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "521814df-72e3-4fcd-8402-306f901372d1",
              "type": "RELATION",
              "name": "messageChannels",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Message Channels",
              "description": "Message Channels",
              "icon": "IconMessage",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "b275aa83-4488-464b-a6e4-b9b641630259",
                  "nameSingular": "connectedAccount",
                  "namePlural": "connectedAccounts"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4ccdf309-8939-4852-ac6d-4a2691cde89e",
                  "nameSingular": "messageChannel",
                  "namePlural": "messageChannels"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "521814df-72e3-4fcd-8402-306f901372d1",
                  "name": "messageChannels"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "11cfcc54-b483-45dc-b0e1-01d5956ca8d5",
                  "name": "connectedAccount"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "c85fc80b-138c-48c4-b790-4b23d267f72d",
              "type": "RELATION",
              "name": "calendarChannels",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Calendar Channels",
              "description": "Calendar Channels",
              "icon": "IconCalendar",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "b275aa83-4488-464b-a6e4-b9b641630259",
                  "nameSingular": "connectedAccount",
                  "namePlural": "connectedAccounts"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "0a927681-9662-45ea-9254-e21eea85305d",
                  "nameSingular": "calendarChannel",
                  "namePlural": "calendarChannels"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "c85fc80b-138c-48c4-b790-4b23d267f72d",
                  "name": "calendarChannels"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "5594073e-be16-45fe-9718-4ee91c3b48fc",
                  "name": "connectedAccount"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "adc935a0-5b4f-4dc1-a4c1-6b411c9afaa2",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "calendarEvent",
          "namePlural": "calendarEvents",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "6f28041a-aa68-43db-a015-b4b69231fd4d",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Calendar event",
          "labelPlural": "Calendar events",
          "description": "Calendar events",
          "icon": "IconCalendar",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "6f28041a-aa68-43db-a015-b4b69231fd4d",
              "type": "TEXT",
              "name": "title",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Title",
              "description": "Title",
              "icon": "IconH1"
            },
            {
              "__typename": "Field",
              "id": "68a2f6e6-97ac-4dfe-914e-07ea923b9625",
              "type": "BOOLEAN",
              "name": "isCanceled",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": false,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Is canceled",
              "description": "Is canceled",
              "icon": "IconCalendarCancel"
            },
            {
              "__typename": "Field",
              "id": "3c3935b8-c84e-4ab9-b65c-4ea955ee9328",
              "type": "BOOLEAN",
              "name": "isFullDay",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": false,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Is Full Day",
              "description": "Is Full Day",
              "icon": "IconHours24"
            },
            {
              "__typename": "Field",
              "id": "848e63f1-809c-4da9-af54-0083f6d1cd13",
              "type": "DATE_TIME",
              "name": "startsAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Start Date",
              "description": "Start Date",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "c75ed47f-c849-49c5-af91-e12cb4e8015f",
              "type": "DATE_TIME",
              "name": "endsAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "End Date",
              "description": "End Date",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "41f5f762-50f8-4283-937f-c4a3c43f5ba4",
              "type": "DATE_TIME",
              "name": "externalCreatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation DateTime",
              "description": "Creation DateTime",
              "icon": "IconCalendarPlus"
            },
            {
              "__typename": "Field",
              "id": "f47897d6-1a44-4818-b5cf-6d04aa4078a2",
              "type": "DATE_TIME",
              "name": "externalUpdatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Update DateTime",
              "description": "Update DateTime",
              "icon": "IconCalendarCog"
            },
            {
              "__typename": "Field",
              "id": "1a76aa68-a76f-420e-813f-29d50a8ebc3d",
              "type": "TEXT",
              "name": "description",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Description",
              "description": "Description",
              "icon": "IconFileDescription"
            },
            {
              "__typename": "Field",
              "id": "f7e8ad07-8e96-407e-abe6-a61968920cf7",
              "type": "TEXT",
              "name": "location",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Location",
              "description": "Location",
              "icon": "IconMapPin"
            },
            {
              "__typename": "Field",
              "id": "9493ac29-942e-4005-8d11-80bd39b4b4bb",
              "type": "TEXT",
              "name": "iCalUID",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "iCal UID",
              "description": "iCal UID",
              "icon": "IconKey"
            },
            {
              "__typename": "Field",
              "id": "ddc51765-9e6d-4fc9-a0ec-efa7e78a368e",
              "type": "TEXT",
              "name": "conferenceSolution",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Conference Solution",
              "description": "Conference Solution",
              "icon": "IconScreenShare"
            },
            {
              "__typename": "Field",
              "id": "f5ea8467-c6a6-4958-a03a-bbf15b83acdf",
              "type": "LINKS",
              "name": "conferenceLink",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": {
                "primaryLinkUrl": "''",
                "secondaryLinks": "'[]'",
                "primaryLinkLabel": "''"
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Meet Link",
              "description": "Meet Link",
              "icon": "IconLink"
            },
            {
              "__typename": "Field",
              "id": "f8065d74-1923-4c0e-810a-a3ef48daf388",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "09fd7789-c89a-47a6-b0e9-1ea626ff4c09",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "281993fd-208a-48a4-a929-cbd03c73766c",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "b3dc63eb-9e62-4d7e-ad80-d4191587dfa6",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "d0532282-ad17-4237-997c-dea0e4224dca",
              "type": "RELATION",
              "name": "calendarChannelEventAssociations",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Calendar Channel Event Associations",
              "description": "Calendar Channel Event Associations",
              "icon": "IconCalendar",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "adc935a0-5b4f-4dc1-a4c1-6b411c9afaa2",
                  "nameSingular": "calendarEvent",
                  "namePlural": "calendarEvents"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "033ed93d-339f-4c5d-9fe8-846abc0972ae",
                  "nameSingular": "calendarChannelEventAssociation",
                  "namePlural": "calendarChannelEventAssociations"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "d0532282-ad17-4237-997c-dea0e4224dca",
                  "name": "calendarChannelEventAssociations"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "f2711264-d589-4c7c-b7ee-5c7650236f77",
                  "name": "calendarEvent"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "7af69ce0-cb79-4adb-8bdc-169b859398dc",
              "type": "RELATION",
              "name": "calendarEventParticipants",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Event Participants",
              "description": "Event Participants",
              "icon": "IconUserCircle",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "adc935a0-5b4f-4dc1-a4c1-6b411c9afaa2",
                  "nameSingular": "calendarEvent",
                  "namePlural": "calendarEvents"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "d5a6519c-0d38-4156-9993-8ccb4fb26812",
                  "nameSingular": "calendarEventParticipant",
                  "namePlural": "calendarEventParticipants"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "7af69ce0-cb79-4adb-8bdc-169b859398dc",
                  "name": "calendarEventParticipants"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "642e2c73-3009-4ea7-97bb-e8e0d46b6006",
                  "name": "calendarEvent"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "adadcec9-e1b9-404c-b525-0a433f4db757",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "messageThread",
          "namePlural": "messageThreads",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "8e0ee094-88d0-45ac-b642-0e9ac58b23c3",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Message Thread",
          "labelPlural": "Message Threads",
          "description": "A group of related messages (e.g. email thread, chat thread)",
          "icon": "IconMessage",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "8e0ee094-88d0-45ac-b642-0e9ac58b23c3",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "021f14ff-e3ac-497b-b864-2a1091dca09d",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "813fd61e-e9da-41b8-91ae-08e0b3da2d24",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "b8ebd617-bbd6-4576-98b7-765774d022ec",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "0942120f-586d-43b9-9632-0d68f32ad566",
              "type": "RELATION",
              "name": "messages",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Messages",
              "description": "Messages from the thread.",
              "icon": "IconMessage",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "adadcec9-e1b9-404c-b525-0a433f4db757",
                  "nameSingular": "messageThread",
                  "namePlural": "messageThreads"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "9a45b86e-5b27-4202-9591-ad5f659cb0d9",
                  "nameSingular": "message",
                  "namePlural": "messages"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "0942120f-586d-43b9-9632-0d68f32ad566",
                  "name": "messages"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "ab913d84-5fb2-4635-ba8a-c86156f90a76",
                  "name": "messageThread"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "a4eb83cc-1658-4e9c-98d9-d759b15fa475",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "apiKey",
          "namePlural": "apiKeys",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "1d33fe6b-95a4-449c-afb5-9c827539e138",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "API Key",
          "labelPlural": "API Keys",
          "description": "An API key",
          "icon": "IconRobot",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "1d33fe6b-95a4-449c-afb5-9c827539e138",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Name",
              "description": "ApiKey name",
              "icon": "IconLink"
            },
            {
              "__typename": "Field",
              "id": "46560853-09d3-4042-a6e2-f475844d0f03",
              "type": "DATE_TIME",
              "name": "expiresAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Expiration date",
              "description": "ApiKey expiration date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "4f86429d-a16f-436c-b0f1-02655f076e42",
              "type": "DATE_TIME",
              "name": "revokedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Revocation date",
              "description": "ApiKey revocation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "354789b4-ee8b-4b4a-b07d-ab52f2131504",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "a6d860d7-2fca-47d9-b0f6-640c1a862713",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "32ac0fe8-7d8d-44c4-a228-fe448aedb659",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "5b4d0b25-57fc-4fb9-a52f-1325625b718d",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "9c5ae6bd-a403-4769-a50b-9953e6f5113b",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "workflow",
          "namePlural": "workflows",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": false,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "72055093-e28f-429f-b2ab-f7af5d4aab15",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": "W",
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Workflow",
          "labelPlural": "Workflows",
          "description": "A workflow",
          "icon": "IconSettingsAutomation",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "72055093-e28f-429f-b2ab-f7af5d4aab15",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Name",
              "description": "The workflow name",
              "icon": "IconSettingsAutomation"
            },
            {
              "__typename": "Field",
              "id": "ced1c1a8-e075-416f-a1ba-e92f89e9c940",
              "type": "TEXT",
              "name": "lastPublishedVersionId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last published Version Id",
              "description": "The workflow last published version id",
              "icon": "IconVersions"
            },
            {
              "__typename": "Field",
              "id": "74b6c44d-81fd-4693-9454-40bc8d26cc9a",
              "type": "MULTI_SELECT",
              "name": "statuses",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
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
                  "color": "gray",
                  "label": "Deactivated",
                  "value": "DEACTIVATED",
                  "position": 2
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Statuses",
              "description": "The current statuses of the workflow versions",
              "icon": "IconStatusChange"
            },
            {
              "__typename": "Field",
              "id": "900f6cf2-8904-40c2-b566-8451917f7820",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": 0,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Position",
              "description": "Workflow record position",
              "icon": "IconHierarchy2"
            },
            {
              "__typename": "Field",
              "id": "947cf54e-3a35-496f-b65c-19897af4a714",
              "type": "ACTOR",
              "name": "createdBy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": {
                "name": "'System'",
                "source": "'MANUAL'",
                "context": {}
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Created by",
              "description": "The creator of the record",
              "icon": "IconCreativeCommonsSa"
            },
            {
              "__typename": "Field",
              "id": "ceaeed2d-94cf-46d5-9af1-1fb3e635ab67",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "34ec88be-7788-430f-b8ec-aa2b6a558d31",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "7d5a1439-5bcd-4a43-978f-d239d162525b",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "1e051bd4-4285-4b09-9846-6b9736410244",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "3b45d90f-e121-4b32-a826-7c87cb75a52a",
              "type": "RELATION",
              "name": "versions",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Versions",
              "description": "Workflow versions linked to the workflow.",
              "icon": "IconVersions",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "9c5ae6bd-a403-4769-a50b-9953e6f5113b",
                  "nameSingular": "workflow",
                  "namePlural": "workflows"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "fed7d356-a8b2-4861-8624-2f48b6358d37",
                  "nameSingular": "workflowVersion",
                  "namePlural": "workflowVersions"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "3b45d90f-e121-4b32-a826-7c87cb75a52a",
                  "name": "versions"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "20dc68ab-74e2-4771-8812-a5ffb3aa9151",
                  "name": "workflow"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "d21eecc7-bd47-4b5b-8aa2-a9b9ae486723",
              "type": "RELATION",
              "name": "runs",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Runs",
              "description": "Workflow runs linked to the workflow.",
              "icon": "IconRun",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "9c5ae6bd-a403-4769-a50b-9953e6f5113b",
                  "nameSingular": "workflow",
                  "namePlural": "workflows"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "3fe7df0e-03c0-40e9-8242-bb475c9be8fb",
                  "nameSingular": "workflowRun",
                  "namePlural": "workflowRuns"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "d21eecc7-bd47-4b5b-8aa2-a9b9ae486723",
                  "name": "runs"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "a3d6322d-24bc-41cb-b3fb-e403e0e9af8f",
                  "name": "workflow"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "37a495e6-dbdf-4102-98d4-f45132c13430",
              "type": "RELATION",
              "name": "automatedTriggers",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Automated Triggers",
              "description": "Workflow automated triggers linked to the workflow.",
              "icon": "",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "9c5ae6bd-a403-4769-a50b-9953e6f5113b",
                  "nameSingular": "workflow",
                  "namePlural": "workflows"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4e245e5e-c2a1-43c3-9744-d39599d55ed1",
                  "nameSingular": "workflowAutomatedTrigger",
                  "namePlural": "workflowAutomatedTriggers"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "37a495e6-dbdf-4102-98d4-f45132c13430",
                  "name": "automatedTriggers"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "0c75cad9-05bb-4d18-82bd-6ec0a587549d",
                  "name": "workflow"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "4adbeb63-d401-483f-8930-cd1aa53f55cb",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Favorites",
              "description": "Favorites linked to the workflow",
              "icon": "IconHeart",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "9c5ae6bd-a403-4769-a50b-9953e6f5113b",
                  "nameSingular": "workflow",
                  "namePlural": "workflows"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "4adbeb63-d401-483f-8930-cd1aa53f55cb",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "f35cb9ad-bbb6-4775-9902-9d00d28dfb6d",
                  "name": "workflow"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "fe236d65-c893-486e-90d0-f8689df40b0b",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Timeline Activities",
              "description": "Timeline activities linked to the workflow",
              "icon": "",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "9c5ae6bd-a403-4769-a50b-9953e6f5113b",
                  "nameSingular": "workflow",
                  "namePlural": "workflows"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "fe236d65-c893-486e-90d0-f8689df40b0b",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "5e94f750-d406-4c00-a637-6c646eb93901",
                  "name": "workflow"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "9a45b86e-5b27-4202-9591-ad5f659cb0d9",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "message",
          "namePlural": "messages",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "3b42064b-2c50-4a98-9924-839c34f934f8",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Message",
          "labelPlural": "Messages",
          "description": "A message sent or received through a messaging channel (email, chat, etc.)",
          "icon": "IconMessage",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "2ac73755-6307-4116-9546-29495ee81594",
              "type": "TEXT",
              "name": "headerMessageId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Header message Id",
              "description": "Message id from the message header",
              "icon": "IconHash"
            },
            {
              "__typename": "Field",
              "id": "3b42064b-2c50-4a98-9924-839c34f934f8",
              "type": "TEXT",
              "name": "subject",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Subject",
              "description": "Subject",
              "icon": "IconMessage"
            },
            {
              "__typename": "Field",
              "id": "560aaba6-2dc5-4a43-b0f2-d73b4703cd23",
              "type": "TEXT",
              "name": "text",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Text",
              "description": "Text",
              "icon": "IconMessage"
            },
            {
              "__typename": "Field",
              "id": "1554c93a-4e3d-476d-a586-57f0461c9600",
              "type": "DATE_TIME",
              "name": "receivedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Received At",
              "description": "The date the message was received",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "ced9c156-f817-4b2b-a380-33073dcceadc",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "a3f59d19-f1b3-4961-aa9d-054c57147b02",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "6c47d42f-0d51-469a-af09-d10f0b254229",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "615009b1-5194-4963-ac89-1657ae329206",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "ab913d84-5fb2-4635-ba8a-c86156f90a76",
              "type": "RELATION",
              "name": "messageThread",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "messageThreadId"
              },
              "isLabelSyncedWithName": false,
              "label": "Message Thread Id",
              "description": "Message Thread Id",
              "icon": "IconHash",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "9a45b86e-5b27-4202-9591-ad5f659cb0d9",
                  "nameSingular": "message",
                  "namePlural": "messages"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "adadcec9-e1b9-404c-b525-0a433f4db757",
                  "nameSingular": "messageThread",
                  "namePlural": "messageThreads"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "ab913d84-5fb2-4635-ba8a-c86156f90a76",
                  "name": "messageThread"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "0942120f-586d-43b9-9632-0d68f32ad566",
                  "name": "messages"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "c6395fff-413b-4dde-a13d-7016cf2de92c",
              "type": "RELATION",
              "name": "messageParticipants",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Message Participants",
              "description": "Message Participants",
              "icon": "IconUserCircle",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "9a45b86e-5b27-4202-9591-ad5f659cb0d9",
                  "nameSingular": "message",
                  "namePlural": "messages"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "8815db3a-6b82-42b3-ab0c-e7452efc0d65",
                  "nameSingular": "messageParticipant",
                  "namePlural": "messageParticipants"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "c6395fff-413b-4dde-a13d-7016cf2de92c",
                  "name": "messageParticipants"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "95353317-14fe-44df-8e4d-945cc735a195",
                  "name": "message"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "fcdc6705-b24d-4d74-bcb9-9d76860f10b0",
              "type": "RELATION",
              "name": "messageChannelMessageAssociations",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Message Channel Association",
              "description": "Messages from the channel.",
              "icon": "IconMessage",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "9a45b86e-5b27-4202-9591-ad5f659cb0d9",
                  "nameSingular": "message",
                  "namePlural": "messages"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "3665f54d-63e3-401a-9dbf-6365eacf5313",
                  "nameSingular": "messageChannelMessageAssociation",
                  "namePlural": "messageChannelMessageAssociations"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "fcdc6705-b24d-4d74-bcb9-9d76860f10b0",
                  "name": "messageChannelMessageAssociations"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "1b83ce4e-1b2d-4a15-9353-17fd7cea9020",
                  "name": "message"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "93c079c7-1af4-4f0b-970a-cac536005231",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "view",
          "namePlural": "views",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "5b8677f8-af6e-4266-b8f3-500567e44376",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "View",
          "labelPlural": "Views",
          "description": "(System) Views",
          "icon": "IconLayoutCollage",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "5b8677f8-af6e-4266-b8f3-500567e44376",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Name",
              "description": "View name",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "36deb236-e754-43ff-88a0-6f2f4206e6bd",
              "type": "UUID",
              "name": "objectMetadataId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Object Metadata Id",
              "description": "View target object",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "a88e4eca-838f-4537-87fa-5fe8dadeac4b",
              "type": "TEXT",
              "name": "type",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'table'",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Type",
              "description": "View type",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "9c074eab-a2e2-402d-8380-978c799fd682",
              "type": "SELECT",
              "name": "key",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'INDEX'",
              "options": [
                {
                  "id": "511a0d5b-6023-477f-abbb-3bb07065a2cc",
                  "color": "red",
                  "label": "Index",
                  "value": "INDEX",
                  "position": 0
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Key",
              "description": "View key",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "8352749f-c58f-42ce-93e3-b146d785ec22",
              "type": "TEXT",
              "name": "icon",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Icon",
              "description": "View icon",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "f91af28e-fe2a-40b6-9c86-eca6d6c1d25c",
              "type": "TEXT",
              "name": "kanbanFieldMetadataId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "kanbanfieldMetadataId",
              "description": "View Kanban column field",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "1a77e9ad-600e-4ffe-a076-e813ea15a19d",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": 0,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Position",
              "description": "View position",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "a194bcd6-ddf3-4e31-876f-4d66c6b31282",
              "type": "BOOLEAN",
              "name": "isCompact",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": false,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Compact View",
              "description": "Describes if the view is in compact mode",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "3d6f689b-eba6-46b2-a8e9-305f537e4529",
              "type": "SELECT",
              "name": "openRecordIn",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'SIDE_PANEL'",
              "options": [
                {
                  "id": "6afeccb5-0903-4000-9ca5-e56e1cc77a2c",
                  "color": "green",
                  "label": "Side Panel",
                  "value": "SIDE_PANEL",
                  "position": 0
                },
                {
                  "id": "84a212f8-a502-48fe-9c00-e80974064ecb",
                  "color": "blue",
                  "label": "Record Page",
                  "value": "RECORD_PAGE",
                  "position": 1
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Open Record In",
              "description": "Display the records in a side panel or in a record page",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "f194e016-ccdb-401d-9b84-d7061bf779c5",
              "type": "SELECT",
              "name": "kanbanAggregateOperation",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'COUNT'",
              "options": [
                {
                  "id": "ff509e4c-de41-405c-aea2-6099c7871431",
                  "color": "red",
                  "label": "Average",
                  "value": "AVG",
                  "position": 0
                },
                {
                  "id": "532a9ff6-a4a5-4233-aee9-c03e6cdd6f02",
                  "color": "purple",
                  "label": "Count",
                  "value": "COUNT",
                  "position": 1
                },
                {
                  "id": "df5044c3-631d-4f10-a802-2577191ef952",
                  "color": "sky",
                  "label": "Maximum",
                  "value": "MAX",
                  "position": 2
                },
                {
                  "id": "1f40ea43-b9e0-42c6-a451-28556fde6538",
                  "color": "turquoise",
                  "label": "Minimum",
                  "value": "MIN",
                  "position": 3
                },
                {
                  "id": "da553f82-4c28-4944-8fb0-2eba59fe2b70",
                  "color": "yellow",
                  "label": "Sum",
                  "value": "SUM",
                  "position": 4
                },
                {
                  "id": "4ecdcefc-8ee4-424a-85b2-afbeef31aba6",
                  "color": "red",
                  "label": "Count empty",
                  "value": "COUNT_EMPTY",
                  "position": 5
                },
                {
                  "id": "cbac3575-72f6-4e2c-87aa-d4f4dbef63e1",
                  "color": "purple",
                  "label": "Count not empty",
                  "value": "COUNT_NOT_EMPTY",
                  "position": 6
                },
                {
                  "id": "975fcd2a-91a5-46b0-aaa2-158505402f17",
                  "color": "sky",
                  "label": "Count unique values",
                  "value": "COUNT_UNIQUE_VALUES",
                  "position": 7
                },
                {
                  "id": "6ea39db2-6d43-450b-9773-a357364874ed",
                  "color": "turquoise",
                  "label": "Percent empty",
                  "value": "PERCENTAGE_EMPTY",
                  "position": 8
                },
                {
                  "id": "fb7186c7-e497-446d-a4c4-c06e4979927d",
                  "color": "yellow",
                  "label": "Percent not empty",
                  "value": "PERCENTAGE_NOT_EMPTY",
                  "position": 9
                },
                {
                  "id": "85c0db49-d534-49e1-87e3-9ac213b7bae4",
                  "color": "red",
                  "label": "Count true",
                  "value": "COUNT_TRUE",
                  "position": 10
                },
                {
                  "id": "123b27cd-9355-4693-8640-ddf6a029e185",
                  "color": "purple",
                  "label": "Count false",
                  "value": "COUNT_FALSE",
                  "position": 11
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Aggregate operation",
              "description": "Optional aggregate operation",
              "icon": "IconCalculator"
            },
            {
              "__typename": "Field",
              "id": "3359fee1-f477-4f8f-8ecb-024b459fcb58",
              "type": "UUID",
              "name": "kanbanAggregateOperationFieldMetadataId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Field metadata used for aggregate operation",
              "description": "Field metadata used for aggregate operation",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "44b7267c-5b3e-4a45-bc43-e752e591cb23",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "786ee449-8539-44fa-bc1d-4e17bace1b81",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "c2b5374b-c9ce-4df8-bd48-b27576186e8b",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "4a4d22e4-84a4-4ab9-bc42-bf5fb32d28b3",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "89662f5c-7a70-483c-a73f-9648bca7fb93",
              "type": "RELATION",
              "name": "viewFields",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "View Fields",
              "description": "View Fields",
              "icon": "IconTag",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "93c079c7-1af4-4f0b-970a-cac536005231",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "402717a2-7bb3-4404-b130-7baf8883ea6d",
                  "nameSingular": "viewField",
                  "namePlural": "viewFields"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "89662f5c-7a70-483c-a73f-9648bca7fb93",
                  "name": "viewFields"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "8f35d873-be30-4224-9e50-10b9894d5327",
                  "name": "view"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "ae4bb39b-f525-4c44-b9ba-41d7ac3b892d",
              "type": "RELATION",
              "name": "viewGroups",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "View Groups",
              "description": "View Groups",
              "icon": "IconTag",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "93c079c7-1af4-4f0b-970a-cac536005231",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "22667e6b-0d3c-474f-bfc3-647f9bc0c0bc",
                  "nameSingular": "viewGroup",
                  "namePlural": "viewGroups"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "ae4bb39b-f525-4c44-b9ba-41d7ac3b892d",
                  "name": "viewGroups"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "4e75e96d-233a-4d51-a3ce-b580040e4a10",
                  "name": "view"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "5e6da838-eb7c-4b4d-ba17-65354db95c9d",
              "type": "RELATION",
              "name": "viewFilters",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "View Filters",
              "description": "View Filters",
              "icon": "IconFilterBolt",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "93c079c7-1af4-4f0b-970a-cac536005231",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "c11ab49c-a82a-46dd-b1fe-32d1892b6d46",
                  "nameSingular": "viewFilter",
                  "namePlural": "viewFilters"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "5e6da838-eb7c-4b4d-ba17-65354db95c9d",
                  "name": "viewFilters"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "fcd01ec4-b1c3-47f7-9d8f-b79a1a16ef88",
                  "name": "view"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "da0d7aef-2609-42ba-a171-1febf458f264",
              "type": "RELATION",
              "name": "viewFilterGroups",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "View Filter Groups",
              "description": "View Filter Groups",
              "icon": "IconFilterBolt",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "93c079c7-1af4-4f0b-970a-cac536005231",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "b2c964f4-53ab-4656-bc3b-3d407b1bce7d",
                  "nameSingular": "viewFilterGroup",
                  "namePlural": "viewFilterGroups"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "da0d7aef-2609-42ba-a171-1febf458f264",
                  "name": "viewFilterGroups"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "f83e92ce-12dd-4c72-90f6-5095972e3aa2",
                  "name": "view"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "9321b611-a889-4477-a949-9bc6ac5a407b",
              "type": "RELATION",
              "name": "viewSorts",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "View Sorts",
              "description": "View Sorts",
              "icon": "IconArrowsSort",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "93c079c7-1af4-4f0b-970a-cac536005231",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "713fb75b-a43b-481d-b9eb-23e1705a1225",
                  "nameSingular": "viewSort",
                  "namePlural": "viewSorts"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "9321b611-a889-4477-a949-9bc6ac5a407b",
                  "name": "viewSorts"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "0e43eca3-bc4e-4971-8f49-aa7f48ccd342",
                  "name": "view"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "95b757c5-d1c6-4eed-bbb5-e15c814df862",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Favorites",
              "description": "Favorites linked to the view",
              "icon": "IconHeart",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "93c079c7-1af4-4f0b-970a-cac536005231",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "95b757c5-d1c6-4eed-bbb5-e15c814df862",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "713d8325-0515-46cd-acd8-58be8c244ee0",
                  "name": "view"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "8d1b6c82-bb07-4c00-9b21-19caa65ae99d",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "task",
          "namePlural": "tasks",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": false,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "072fdb2a-71e6-41a8-986a-58f22ff5ecac",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": "T",
          "isLabelSyncedWithName": false,
          "isSearchable": true,
          "duplicateCriteria": null,
          "labelSingular": "Task",
          "labelPlural": "Tasks",
          "description": "A task",
          "icon": "IconCheckbox",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "IndexEdge",
                "node": {
                  "__typename": "Index",
                  "id": "1b42f927-13ac-4faa-8e44-1142bc715144",
                  "createdAt": "2025-06-06T14:42:51.895Z",
                  "updatedAt": "2025-06-06T14:42:51.895Z",
                  "name": "IDX_d01a000cf26e1225d894dc3d364",
                  "indexWhereClause": null,
                  "indexType": "GIN",
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "IndexFieldEdge",
                        "node": {
                          "__typename": "IndexField",
                          "id": "b37071f3-1bd5-4b65-90f9-e75b53696167",
                          "createdAt": "2025-06-06T14:42:51.895Z",
                          "updatedAt": "2025-06-06T14:42:51.895Z",
                          "order": 0,
                          "fieldMetadataId": "2d4572b4-4fa2-4b93-8dff-806ac4804c09"
                        }
                      }
                    ]
                  }
                }
              }
            ]
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "627dba6e-af28-4a8b-b994-635fdc55f7dc",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": 0,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Position",
              "description": "Task record position",
              "icon": "IconHierarchy2"
            },
            {
              "__typename": "Field",
              "id": "072fdb2a-71e6-41a8-986a-58f22ff5ecac",
              "type": "TEXT",
              "name": "title",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Title",
              "description": "Task title",
              "icon": "IconNotes"
            },
            {
              "__typename": "Field",
              "id": "2fb87ce6-852a-4429-9b6c-0ba371b47451",
              "type": "RICH_TEXT",
              "name": "body",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Body (deprecated)",
              "description": "Task body",
              "icon": "IconFilePencil"
            },
            {
              "__typename": "Field",
              "id": "2f83ed84-8058-45b7-90d9-5931ba9fdd6b",
              "type": "RICH_TEXT_V2",
              "name": "bodyV2",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": {
                "markdown": "''",
                "blocknote": "''"
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Body",
              "description": "Task body",
              "icon": "IconFilePencil"
            },
            {
              "__typename": "Field",
              "id": "eb5c8505-6f46-431d-859b-895749386743",
              "type": "DATE_TIME",
              "name": "dueAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Due Date",
              "description": "Task due date",
              "icon": "IconCalendarEvent"
            },
            {
              "__typename": "Field",
              "id": "d6dc4a74-2e1a-48ba-b272-7e20214b2e39",
              "type": "SELECT",
              "name": "status",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'TODO'",
              "options": [
                {
                  "id": "e4f1019b-f093-4e43-8894-60b09410fb4c",
                  "color": "sky",
                  "label": "To do",
                  "value": "TODO",
                  "position": 0
                },
                {
                  "id": "8820cd2d-7868-41c8-831c-8cee8f5a27b7",
                  "color": "purple",
                  "label": "In progress",
                  "value": "IN_PROGRESS",
                  "position": 1
                },
                {
                  "id": "a4ba969a-6ca4-4a18-946a-dc90bee7b665",
                  "color": "green",
                  "label": "Done",
                  "value": "DONE",
                  "position": 2
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Status",
              "description": "Task status",
              "icon": "IconCheck"
            },
            {
              "__typename": "Field",
              "id": "8d1377d9-6e3a-417b-b66d-d734f3230d00",
              "type": "ACTOR",
              "name": "createdBy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": {
                "name": "'System'",
                "source": "'MANUAL'",
                "context": {}
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Created by",
              "description": "The creator of the record",
              "icon": "IconCreativeCommonsSa"
            },
            {
              "__typename": "Field",
              "id": "2d4572b4-4fa2-4b93-8dff-806ac4804c09",
              "type": "TS_VECTOR",
              "name": "searchVector",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Search vector",
              "description": "Field used for full-text search",
              "icon": "IconUser"
            },
            {
              "__typename": "Field",
              "id": "ac10c619-b673-46a6-a38e-edea374cb77d",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "26e07cb8-3743-4ff8-8f9c-fc5f6a230e2a",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "83d42f31-a95f-4fb2-af0b-4fc197669839",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "6c1f9350-14c6-4d77-89e1-b20f4872049c",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "79f9cbcc-154b-4274-84af-644a6c53d879",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Favorites",
              "description": "Favorites linked to the task",
              "icon": "IconHeart",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "8d1b6c82-bb07-4c00-9b21-19caa65ae99d",
                  "nameSingular": "task",
                  "namePlural": "tasks"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "79f9cbcc-154b-4274-84af-644a6c53d879",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "2ad66d24-0475-4e56-805b-d2fb7978e9e5",
                  "name": "task"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "53517dcb-24f4-4752-ab06-5a158a754a99",
              "type": "RELATION",
              "name": "taskTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Relations",
              "description": "Task targets",
              "icon": "IconArrowUpRight",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "8d1b6c82-bb07-4c00-9b21-19caa65ae99d",
                  "nameSingular": "task",
                  "namePlural": "tasks"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4abbd2fa-de1a-4f59-b5dd-3c51023b9003",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "53517dcb-24f4-4752-ab06-5a158a754a99",
                  "name": "taskTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "182a5732-b4cb-443b-84ff-ee8b201e875a",
                  "name": "task"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "f5f77de6-beb2-4a59-a143-ed85a06afe34",
              "type": "RELATION",
              "name": "attachments",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Attachments",
              "description": "Task attachments",
              "icon": "IconFileImport",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "8d1b6c82-bb07-4c00-9b21-19caa65ae99d",
                  "nameSingular": "task",
                  "namePlural": "tasks"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "3001f4f9-fd3e-4403-8f1f-bc8a135e2619",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "f5f77de6-beb2-4a59-a143-ed85a06afe34",
                  "name": "attachments"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "cc01039c-2c64-4964-b4c9-7fb762f42667",
                  "name": "task"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "8b28fc1b-05c9-4676-84d0-f50ec8e20060",
              "type": "RELATION",
              "name": "assignee",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "SET_NULL",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "assigneeId"
              },
              "isLabelSyncedWithName": false,
              "label": "Assignee",
              "description": "Task assignee",
              "icon": "IconUserCircle",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "8d1b6c82-bb07-4c00-9b21-19caa65ae99d",
                  "nameSingular": "task",
                  "namePlural": "tasks"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "5821980a-4c2e-455c-8bb6-1a1eb0bf2b36",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "8b28fc1b-05c9-4676-84d0-f50ec8e20060",
                  "name": "assignee"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "e03db82c-1940-44b0-869d-78ca451e7bcf",
                  "name": "assignedTasks"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "b11123f5-443c-4934-b41b-3438eeaac3c0",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Timeline Activities",
              "description": "Timeline Activities linked to the task.",
              "icon": "IconTimelineEvent",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "8d1b6c82-bb07-4c00-9b21-19caa65ae99d",
                  "nameSingular": "task",
                  "namePlural": "tasks"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "b11123f5-443c-4934-b41b-3438eeaac3c0",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "84338e52-0a4f-451c-a2dd-aec65324b584",
                  "name": "task"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "8ceca214-6ae0-4eb4-806f-dae127ca6f9b",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "company",
          "namePlural": "companies",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": false,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "b3a19b3d-6f14-4709-a38b-2aff22740c8a",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": "C",
          "isLabelSyncedWithName": false,
          "isSearchable": true,
          "duplicateCriteria": [
            [
              "name"
            ],
            [
              "domainNamePrimaryLinkUrl"
            ]
          ],
          "labelSingular": "Company",
          "labelPlural": "Companies",
          "description": "A company",
          "icon": "IconBuildingSkyscraper",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "IndexEdge",
                "node": {
                  "__typename": "Index",
                  "id": "7ab2ec62-8511-43c8-a1bb-3d8c8d60db66",
                  "createdAt": "2025-06-06T14:42:51.895Z",
                  "updatedAt": "2025-06-06T14:42:51.895Z",
                  "name": "IDX_UNIQUE_2a32339058d0b6910b0834ddf81",
                  "indexWhereClause": null,
                  "indexType": "BTREE",
                  "isUnique": true,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "IndexFieldEdge",
                        "node": {
                          "__typename": "IndexField",
                          "id": "c6ff28e4-13ae-4ba4-adaa-6985584599f0",
                          "createdAt": "2025-06-06T14:42:51.895Z",
                          "updatedAt": "2025-06-06T14:42:51.895Z",
                          "order": 0,
                          "fieldMetadataId": "8c40174d-3213-4631-be82-a7e76cffa628"
                        }
                      }
                    ]
                  }
                }
              },
              {
                "__typename": "IndexEdge",
                "node": {
                  "__typename": "Index",
                  "id": "fa4e1254-9a01-48b2-b154-3c64086be257",
                  "createdAt": "2025-06-06T14:42:51.895Z",
                  "updatedAt": "2025-06-06T14:42:51.895Z",
                  "name": "IDX_fb1f4905546cfc6d70a971c76f7",
                  "indexWhereClause": null,
                  "indexType": "GIN",
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "IndexFieldEdge",
                        "node": {
                          "__typename": "IndexField",
                          "id": "e9ea71f3-5a1a-47e1-8d4a-4905502436db",
                          "createdAt": "2025-06-06T14:42:51.895Z",
                          "updatedAt": "2025-06-06T14:42:51.895Z",
                          "order": 0,
                          "fieldMetadataId": "78eef374-b788-4601-a52a-60aa28a0c9eb"
                        }
                      }
                    ]
                  }
                }
              }
            ]
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "b3a19b3d-6f14-4709-a38b-2aff22740c8a",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Name",
              "description": "The company name",
              "icon": "IconBuildingSkyscraper"
            },
            {
              "__typename": "Field",
              "id": "8c40174d-3213-4631-be82-a7e76cffa628",
              "type": "LINKS",
              "name": "domainName",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": true,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": {
                "primaryLinkUrl": "''",
                "secondaryLinks": "'[]'",
                "primaryLinkLabel": "''"
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Domain Name",
              "description": "The company website URL. We use this url to fetch the company icon",
              "icon": "IconLink"
            },
            {
              "__typename": "Field",
              "id": "776511d9-d2bb-4306-bd88-c25ef39eb3bf",
              "type": "NUMBER",
              "name": "employees",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Employees",
              "description": "Number of employees in the company",
              "icon": "IconUsers"
            },
            {
              "__typename": "Field",
              "id": "4088dcb6-80cd-4e89-ac8c-23b624d59d84",
              "type": "LINKS",
              "name": "linkedinLink",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": {
                "primaryLinkUrl": "''",
                "secondaryLinks": "'[]'",
                "primaryLinkLabel": "''"
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Linkedin",
              "description": "The company Linkedin account",
              "icon": "IconBrandLinkedin"
            },
            {
              "__typename": "Field",
              "id": "9384ca75-d50c-4827-bd2e-957d51672cc8",
              "type": "LINKS",
              "name": "xLink",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": {
                "primaryLinkUrl": "''",
                "secondaryLinks": "'[]'",
                "primaryLinkLabel": "''"
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "X",
              "description": "The company Twitter/X account",
              "icon": "IconBrandX"
            },
            {
              "__typename": "Field",
              "id": "9caaa78a-4dce-4e03-9b6a-5e96c58d30b7",
              "type": "CURRENCY",
              "name": "annualRecurringRevenue",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": {
                "amountMicros": null,
                "currencyCode": "''"
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "ARR",
              "description": "Annual Recurring Revenue: The actual or estimated annual revenue of the company",
              "icon": "IconMoneybag"
            },
            {
              "__typename": "Field",
              "id": "921a3696-c99f-4499-aed2-758c5d530eeb",
              "type": "ADDRESS",
              "name": "address",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
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
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Address",
              "description": "Address of the company",
              "icon": "IconMap"
            },
            {
              "__typename": "Field",
              "id": "16ebcbfb-2a79-44ea-9e6e-302e6289cd25",
              "type": "BOOLEAN",
              "name": "idealCustomerProfile",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": false,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "ICP",
              "description": "Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you",
              "icon": "IconTarget"
            },
            {
              "__typename": "Field",
              "id": "dd69d46b-6c73-4627-abd6-37cdec66026a",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": 0,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Position",
              "description": "Company record position",
              "icon": "IconHierarchy2"
            },
            {
              "__typename": "Field",
              "id": "e58e7e1c-89e7-4494-aa2d-8629a61bddfe",
              "type": "ACTOR",
              "name": "createdBy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": {
                "name": "'System'",
                "source": "'MANUAL'",
                "context": {}
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Created by",
              "description": "The creator of the record",
              "icon": "IconCreativeCommonsSa"
            },
            {
              "__typename": "Field",
              "id": "78eef374-b788-4601-a52a-60aa28a0c9eb",
              "type": "TS_VECTOR",
              "name": "searchVector",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Search vector",
              "description": "Field used for full-text search",
              "icon": "IconUser"
            },
            {
              "__typename": "Field",
              "id": "3899466e-3935-4b63-9033-f2f7a99f3fbd",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "93302873-cb7c-4405-a7ae-5b42c5fe1b7c",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "fcf31219-5500-4f72-a1e7-c2ca560cbd20",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "e5ca73d4-61c1-406d-bd3e-2f46f94bb475",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "258b9e2e-b63d-42f6-bd14-1891fdad7f1b",
              "type": "RELATION",
              "name": "people",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "People",
              "description": "People linked to the company.",
              "icon": "IconUsers",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "8ceca214-6ae0-4eb4-806f-dae127ca6f9b",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "5926b097-a8a9-4baa-a001-fa7034aad925",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "258b9e2e-b63d-42f6-bd14-1891fdad7f1b",
                  "name": "people"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "3fcd2494-bdbe-461a-b48b-d26e7de21a1f",
                  "name": "company"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "d46783eb-ab42-47b6-bae4-014570218f7c",
              "type": "RELATION",
              "name": "accountOwner",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "SET_NULL",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "accountOwnerId"
              },
              "isLabelSyncedWithName": false,
              "label": "Account Owner",
              "description": "Your team member responsible for managing the company account",
              "icon": "IconUserCircle",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "8ceca214-6ae0-4eb4-806f-dae127ca6f9b",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "5821980a-4c2e-455c-8bb6-1a1eb0bf2b36",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "d46783eb-ab42-47b6-bae4-014570218f7c",
                  "name": "accountOwner"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "dcfdeeb5-905a-4832-a430-c28a2f6cdf8d",
                  "name": "accountOwnerForCompanies"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "23fecd6e-3671-4a61-8bc7-b9746fa620c4",
              "type": "RELATION",
              "name": "taskTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Tasks",
              "description": "Tasks tied to the company",
              "icon": "IconCheckbox",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "8ceca214-6ae0-4eb4-806f-dae127ca6f9b",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4abbd2fa-de1a-4f59-b5dd-3c51023b9003",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "23fecd6e-3671-4a61-8bc7-b9746fa620c4",
                  "name": "taskTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "d40466a2-2707-4272-b5ba-d666381429f2",
                  "name": "company"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "ba9a17cb-da96-4b09-afe6-f01e8c6b47af",
              "type": "RELATION",
              "name": "noteTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Notes",
              "description": "Notes tied to the company",
              "icon": "IconNotes",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "8ceca214-6ae0-4eb4-806f-dae127ca6f9b",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "897567d1-bee8-420d-8734-0a18459ea1d1",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "ba9a17cb-da96-4b09-afe6-f01e8c6b47af",
                  "name": "noteTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "d7f3ce58-6c8b-45db-953d-092241ac1d28",
                  "name": "company"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "24680c77-9859-4722-9e39-98abbbd64a43",
              "type": "RELATION",
              "name": "opportunities",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Opportunities",
              "description": "Opportunities linked to the company.",
              "icon": "IconTargetArrow",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "8ceca214-6ae0-4eb4-806f-dae127ca6f9b",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "716f221d-8141-4c27-a049-d25b4fb5cfcc",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "24680c77-9859-4722-9e39-98abbbd64a43",
                  "name": "opportunities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "bba3f1d9-3880-42c4-8318-0217e07157c3",
                  "name": "company"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "e63fa485-a5dd-41dc-b5de-5a0c234571c9",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Favorites",
              "description": "Favorites linked to the company",
              "icon": "IconHeart",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "8ceca214-6ae0-4eb4-806f-dae127ca6f9b",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "e63fa485-a5dd-41dc-b5de-5a0c234571c9",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "0c62ebc8-6af8-4995-913d-6101dfcc8b21",
                  "name": "company"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "140bb2ea-5d92-420d-91b4-3ccbb559fc76",
              "type": "RELATION",
              "name": "attachments",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Attachments",
              "description": "Attachments linked to the company",
              "icon": "IconFileImport",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "8ceca214-6ae0-4eb4-806f-dae127ca6f9b",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "3001f4f9-fd3e-4403-8f1f-bc8a135e2619",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "140bb2ea-5d92-420d-91b4-3ccbb559fc76",
                  "name": "attachments"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "8a9e8fb8-68e1-4293-899e-9e28d769078e",
                  "name": "company"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "162de979-563c-4860-9923-e634a28ac907",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Timeline Activities",
              "description": "Timeline Activities linked to the company",
              "icon": "IconIconTimelineEvent",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "8ceca214-6ae0-4eb4-806f-dae127ca6f9b",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "162de979-563c-4860-9923-e634a28ac907",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "0067a473-4b97-4a49-ba9e-9ec9a614ae99",
                  "name": "company"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "897567d1-bee8-420d-8734-0a18459ea1d1",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "noteTarget",
          "namePlural": "noteTargets",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "3696567d-0323-4137-8c26-70035609f99f",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Note Target",
          "labelPlural": "Note Targets",
          "description": "A note target",
          "icon": "IconCheckbox",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "3696567d-0323-4137-8c26-70035609f99f",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "ab81cd1a-e3a5-4f9a-b16a-5166e6f14aa2",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "c1759cbc-edd4-460e-83c1-bb57915965b0",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "dc0f7129-9743-4688-be21-98383e2ee54e",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "d1f06b62-13dc-4c68-95a2-cc1a8032947c",
              "type": "RELATION",
              "name": "note",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "SET_NULL",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "noteId"
              },
              "isLabelSyncedWithName": false,
              "label": "Note",
              "description": "NoteTarget note",
              "icon": "IconNotes",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "897567d1-bee8-420d-8734-0a18459ea1d1",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "65da8c99-e1a5-4130-86e8-ff4f79b1d6c8",
                  "nameSingular": "note",
                  "namePlural": "notes"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "d1f06b62-13dc-4c68-95a2-cc1a8032947c",
                  "name": "note"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "6618010c-2435-4b84-8a8e-c10ae9b91ecd",
                  "name": "noteTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "2a27ce65-0cfb-4676-a08f-6ed7d92e15fc",
              "type": "RELATION",
              "name": "person",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "personId"
              },
              "isLabelSyncedWithName": false,
              "label": "Person",
              "description": "NoteTarget person",
              "icon": "IconUser",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "897567d1-bee8-420d-8734-0a18459ea1d1",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "5926b097-a8a9-4baa-a001-fa7034aad925",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "2a27ce65-0cfb-4676-a08f-6ed7d92e15fc",
                  "name": "person"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "f3c612aa-0ad7-4070-b003-0b9bb9b93c28",
                  "name": "noteTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "d7f3ce58-6c8b-45db-953d-092241ac1d28",
              "type": "RELATION",
              "name": "company",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "companyId"
              },
              "isLabelSyncedWithName": false,
              "label": "Company",
              "description": "NoteTarget company",
              "icon": "IconBuildingSkyscraper",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "897567d1-bee8-420d-8734-0a18459ea1d1",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "8ceca214-6ae0-4eb4-806f-dae127ca6f9b",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "d7f3ce58-6c8b-45db-953d-092241ac1d28",
                  "name": "company"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "ba9a17cb-da96-4b09-afe6-f01e8c6b47af",
                  "name": "noteTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "a3f31ecd-5923-442c-9cc0-cab8eff8d753",
              "type": "RELATION",
              "name": "opportunity",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "opportunityId"
              },
              "isLabelSyncedWithName": false,
              "label": "Opportunity",
              "description": "NoteTarget opportunity",
              "icon": "IconTargetArrow",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "897567d1-bee8-420d-8734-0a18459ea1d1",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "716f221d-8141-4c27-a049-d25b4fb5cfcc",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "a3f31ecd-5923-442c-9cc0-cab8eff8d753",
                  "name": "opportunity"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "c8491082-fc5c-4bb3-aa45-5261b885a052",
                  "name": "noteTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "0eeb75a0-b87a-40ce-a905-7d776d8f69e6",
              "type": "RELATION",
              "name": "surveyResult",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:07.818Z",
              "updatedAt": "2025-06-06T14:43:07.818Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "surveyResultId"
              },
              "isLabelSyncedWithName": false,
              "label": "Survey result",
              "description": "NoteTargets Survey result",
              "icon": "IconBuildingSkyscraper",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "897567d1-bee8-420d-8734-0a18459ea1d1",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "154570b7-3d4f-401d-ab7f-748903f1be28",
                  "nameSingular": "surveyResult",
                  "namePlural": "surveyResults"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "0eeb75a0-b87a-40ce-a905-7d776d8f69e6",
                  "name": "surveyResult"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "9f305f07-d0d9-499e-88ca-4ec604ddd8e2",
                  "name": "noteTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "75a6dc0b-a918-43ff-923a-87f298b19494",
              "type": "RELATION",
              "name": "rocket",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:02.145Z",
              "updatedAt": "2025-06-06T14:43:02.145Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "rocketId"
              },
              "isLabelSyncedWithName": false,
              "label": "Rocket",
              "description": "NoteTargets Rocket",
              "icon": "IconBuildingSkyscraper",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "897567d1-bee8-420d-8734-0a18459ea1d1",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "0ae004b8-8489-4f02-b54a-b3b123e3db9f",
                  "nameSingular": "rocket",
                  "namePlural": "rockets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "75a6dc0b-a918-43ff-923a-87f298b19494",
                  "name": "rocket"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "a5682ee4-e9a4-4481-8fc2-8108bd417356",
                  "name": "noteTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "2b1524b6-54d6-4199-8718-7dbdf507fd2d",
              "type": "RELATION",
              "name": "pet",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:03.602Z",
              "updatedAt": "2025-06-06T14:43:03.602Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "petId"
              },
              "isLabelSyncedWithName": false,
              "label": "Pet",
              "description": "NoteTargets Pet",
              "icon": "IconBuildingSkyscraper",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "897567d1-bee8-420d-8734-0a18459ea1d1",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "d2a824df-b1a7-421b-a1c4-e2488bf580b9",
                  "nameSingular": "pet",
                  "namePlural": "pets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "2b1524b6-54d6-4199-8718-7dbdf507fd2d",
                  "name": "pet"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "a110ac78-e338-4082-93bd-7b85f18a0606",
                  "name": "noteTargets"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "8815db3a-6b82-42b3-ab0c-e7452efc0d65",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "messageParticipant",
          "namePlural": "messageParticipants",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "3351c9f2-6620-4b65-84d3-404dd68a3ace",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Message Participant",
          "labelPlural": "Message Participants",
          "description": "Message Participants",
          "icon": "IconUserCircle",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "59f0c73c-fcaf-42e8-824a-cb4b509b5902",
              "type": "SELECT",
              "name": "role",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'from'",
              "options": [
                {
                  "id": "aff0d9d2-2f76-46a4-9e8c-26109e56b30d",
                  "color": "green",
                  "label": "From",
                  "value": "from",
                  "position": 0
                },
                {
                  "id": "3957c504-db97-4289-bebb-19eb22a97d1d",
                  "color": "blue",
                  "label": "To",
                  "value": "to",
                  "position": 1
                },
                {
                  "id": "e2a64698-70ec-4670-b31b-61e516589b51",
                  "color": "orange",
                  "label": "Cc",
                  "value": "cc",
                  "position": 2
                },
                {
                  "id": "5a201976-603e-4a19-b953-8ab7c8b274a8",
                  "color": "red",
                  "label": "Bcc",
                  "value": "bcc",
                  "position": 3
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Role",
              "description": "Role",
              "icon": "IconAt"
            },
            {
              "__typename": "Field",
              "id": "3351c9f2-6620-4b65-84d3-404dd68a3ace",
              "type": "TEXT",
              "name": "handle",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Handle",
              "description": "Handle",
              "icon": "IconAt"
            },
            {
              "__typename": "Field",
              "id": "41acacbf-a226-4073-9ff2-57bb86eb10ef",
              "type": "TEXT",
              "name": "displayName",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Display Name",
              "description": "Display Name",
              "icon": "IconUser"
            },
            {
              "__typename": "Field",
              "id": "e0c4741b-820e-4f9a-aa3b-ce7bdf3e9dc7",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "6790235e-61ce-4364-aa13-c1554d0df709",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "5c45ef8e-fddb-4671-83f1-118b3d13da9c",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "4fee3946-35ea-4a5f-ac06-29dab21b9eef",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "95353317-14fe-44df-8e4d-945cc735a195",
              "type": "RELATION",
              "name": "message",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "messageId"
              },
              "isLabelSyncedWithName": false,
              "label": "Message",
              "description": "Message",
              "icon": "IconMessage",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "8815db3a-6b82-42b3-ab0c-e7452efc0d65",
                  "nameSingular": "messageParticipant",
                  "namePlural": "messageParticipants"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "9a45b86e-5b27-4202-9591-ad5f659cb0d9",
                  "nameSingular": "message",
                  "namePlural": "messages"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "95353317-14fe-44df-8e4d-945cc735a195",
                  "name": "message"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "c6395fff-413b-4dde-a13d-7016cf2de92c",
                  "name": "messageParticipants"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "eddd7f28-8dfc-4c53-baf2-8fa86b86c2a9",
              "type": "RELATION",
              "name": "person",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "SET_NULL",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "personId"
              },
              "isLabelSyncedWithName": false,
              "label": "Person",
              "description": "Person",
              "icon": "IconUser",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "8815db3a-6b82-42b3-ab0c-e7452efc0d65",
                  "nameSingular": "messageParticipant",
                  "namePlural": "messageParticipants"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "5926b097-a8a9-4baa-a001-fa7034aad925",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "eddd7f28-8dfc-4c53-baf2-8fa86b86c2a9",
                  "name": "person"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "cf8ed2bc-b209-4e83-87a7-810c66e0ea93",
                  "name": "messageParticipants"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "f4254d58-4815-41a2-b034-18a6141827cb",
              "type": "RELATION",
              "name": "workspaceMember",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "SET_NULL",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "workspaceMemberId"
              },
              "isLabelSyncedWithName": false,
              "label": "Workspace Member",
              "description": "Workspace member",
              "icon": "IconCircleUser",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "8815db3a-6b82-42b3-ab0c-e7452efc0d65",
                  "nameSingular": "messageParticipant",
                  "namePlural": "messageParticipants"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "5821980a-4c2e-455c-8bb6-1a1eb0bf2b36",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "f4254d58-4815-41a2-b034-18a6141827cb",
                  "name": "workspaceMember"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "f7844018-284f-458b-bb6d-f6cab830c885",
                  "name": "messageParticipants"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "716f221d-8141-4c27-a049-d25b4fb5cfcc",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "opportunity",
          "namePlural": "opportunities",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": false,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "0f7a1243-2c69-4c58-93ff-e206ad94df1f",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": "O",
          "isLabelSyncedWithName": false,
          "isSearchable": true,
          "duplicateCriteria": null,
          "labelSingular": "Opportunity",
          "labelPlural": "Opportunities",
          "description": "An opportunity",
          "icon": "IconTargetArrow",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "IndexEdge",
                "node": {
                  "__typename": "Index",
                  "id": "29980a75-f8d1-4bd3-be27-6f4824cef2bd",
                  "createdAt": "2025-06-06T14:42:51.895Z",
                  "updatedAt": "2025-06-06T14:42:51.895Z",
                  "name": "IDX_9f96d65260c4676faac27cb6bf3",
                  "indexWhereClause": null,
                  "indexType": "GIN",
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "IndexFieldEdge",
                        "node": {
                          "__typename": "IndexField",
                          "id": "79060b29-8025-4578-9a38-77409c829691",
                          "createdAt": "2025-06-06T14:42:51.895Z",
                          "updatedAt": "2025-06-06T14:42:51.895Z",
                          "order": 0,
                          "fieldMetadataId": "de0b06aa-cbed-46ff-9096-b1ea6471a417"
                        }
                      }
                    ]
                  }
                }
              },
              {
                "__typename": "IndexEdge",
                "node": {
                  "__typename": "Index",
                  "id": "5c03b31a-7ddf-4dc9-8df5-cfb61baf07e2",
                  "createdAt": "2025-06-06T14:42:51.895Z",
                  "updatedAt": "2025-06-06T14:42:51.895Z",
                  "name": "IDX_4f469d3a7ee08aefdc099836364",
                  "indexWhereClause": null,
                  "indexType": "BTREE",
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "IndexFieldEdge",
                        "node": {
                          "__typename": "IndexField",
                          "id": "3e5a86c3-b236-4070-a30c-a920d6046f6e",
                          "createdAt": "2025-06-06T14:42:51.895Z",
                          "updatedAt": "2025-06-06T14:42:51.895Z",
                          "order": 0,
                          "fieldMetadataId": "bf76c534-823e-4306-bf2a-6f477b2e9859"
                        }
                      },
                      {
                        "__typename": "IndexFieldEdge",
                        "node": {
                          "__typename": "IndexField",
                          "id": "225e7142-e724-422b-a714-163ef1436e0f",
                          "createdAt": "2025-06-06T14:42:51.895Z",
                          "updatedAt": "2025-06-06T14:42:51.895Z",
                          "order": 1,
                          "fieldMetadataId": "d0d53700-2b3c-44aa-b352-abb783c753a0"
                        }
                      }
                    ]
                  }
                }
              }
            ]
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "0f7a1243-2c69-4c58-93ff-e206ad94df1f",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Name",
              "description": "The opportunity name",
              "icon": "IconTargetArrow"
            },
            {
              "__typename": "Field",
              "id": "fb7cb09c-4463-4fca-8705-97fdf03d4189",
              "type": "CURRENCY",
              "name": "amount",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": {
                "amountMicros": null,
                "currencyCode": "''"
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Amount",
              "description": "Opportunity amount",
              "icon": "IconCurrencyDollar"
            },
            {
              "__typename": "Field",
              "id": "4ca37d21-f51f-498d-9d6a-41a9b18af39f",
              "type": "DATE_TIME",
              "name": "closeDate",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Close date",
              "description": "Opportunity close date",
              "icon": "IconCalendarEvent"
            },
            {
              "__typename": "Field",
              "id": "bf76c534-823e-4306-bf2a-6f477b2e9859",
              "type": "SELECT",
              "name": "stage",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'NEW'",
              "options": [
                {
                  "id": "1e6ba146-7b74-4719-90fb-8f1628f5692a",
                  "color": "red",
                  "label": "New",
                  "value": "NEW",
                  "position": 0
                },
                {
                  "id": "7e16e21b-3d9e-4cf8-9553-ad56907eaa8f",
                  "color": "purple",
                  "label": "Screening",
                  "value": "SCREENING",
                  "position": 1
                },
                {
                  "id": "2c13c439-f4cc-43ee-8cac-a14a4c93576d",
                  "color": "sky",
                  "label": "Meeting",
                  "value": "MEETING",
                  "position": 2
                },
                {
                  "id": "01400543-2f7b-4c80-b6ff-50a1b8af2d4e",
                  "color": "turquoise",
                  "label": "Proposal",
                  "value": "PROPOSAL",
                  "position": 3
                },
                {
                  "id": "91c45644-5a23-4060-9ea6-9bdea1be3cff",
                  "color": "yellow",
                  "label": "Customer",
                  "value": "CUSTOMER",
                  "position": 4
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Stage",
              "description": "Opportunity stage",
              "icon": "IconProgressCheck"
            },
            {
              "__typename": "Field",
              "id": "57ed48f2-de1e-47ef-b30a-d431f559da37",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": 0,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Position",
              "description": "Opportunity record position",
              "icon": "IconHierarchy2"
            },
            {
              "__typename": "Field",
              "id": "960f8ba4-57f8-47f2-b457-77ca70384fbc",
              "type": "ACTOR",
              "name": "createdBy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": {
                "name": "'System'",
                "source": "'MANUAL'",
                "context": {}
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Created by",
              "description": "The creator of the record",
              "icon": "IconCreativeCommonsSa"
            },
            {
              "__typename": "Field",
              "id": "de0b06aa-cbed-46ff-9096-b1ea6471a417",
              "type": "TS_VECTOR",
              "name": "searchVector",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Search vector",
              "description": "Field used for full-text search",
              "icon": "IconUser"
            },
            {
              "__typename": "Field",
              "id": "d61341b6-50b7-473f-bcac-50f57bd067ef",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "6e49e55f-73f4-4513-8af3-ec8bdb39411c",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "011190fa-85e6-4491-8529-4d44a59fc9b2",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "d0d53700-2b3c-44aa-b352-abb783c753a0",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "d06f5cf6-01cc-460f-a9d9-ddf3516c2977",
              "type": "RELATION",
              "name": "pointOfContact",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "SET_NULL",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "pointOfContactId"
              },
              "isLabelSyncedWithName": false,
              "label": "Point of Contact",
              "description": "Opportunity point of contact",
              "icon": "IconUser",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "716f221d-8141-4c27-a049-d25b4fb5cfcc",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "5926b097-a8a9-4baa-a001-fa7034aad925",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "d06f5cf6-01cc-460f-a9d9-ddf3516c2977",
                  "name": "pointOfContact"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "25e69274-6bb5-427d-9995-a07472eea272",
                  "name": "pointOfContactForOpportunities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "bba3f1d9-3880-42c4-8318-0217e07157c3",
              "type": "RELATION",
              "name": "company",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "SET_NULL",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "companyId"
              },
              "isLabelSyncedWithName": false,
              "label": "Company",
              "description": "Opportunity company",
              "icon": "IconBuildingSkyscraper",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "716f221d-8141-4c27-a049-d25b4fb5cfcc",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "8ceca214-6ae0-4eb4-806f-dae127ca6f9b",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "bba3f1d9-3880-42c4-8318-0217e07157c3",
                  "name": "company"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "24680c77-9859-4722-9e39-98abbbd64a43",
                  "name": "opportunities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "5fa6a112-9c4b-4bd3-bd95-1450bdda8419",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Favorites",
              "description": "Favorites linked to the opportunity",
              "icon": "IconHeart",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "716f221d-8141-4c27-a049-d25b4fb5cfcc",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "5fa6a112-9c4b-4bd3-bd95-1450bdda8419",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "257c4f8f-da83-4fd7-b7c7-a281af98b703",
                  "name": "opportunity"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "0ec0cbda-2f7a-4ae1-a0b3-f1679a52169e",
              "type": "RELATION",
              "name": "taskTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Tasks",
              "description": "Tasks tied to the opportunity",
              "icon": "IconCheckbox",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "716f221d-8141-4c27-a049-d25b4fb5cfcc",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4abbd2fa-de1a-4f59-b5dd-3c51023b9003",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "0ec0cbda-2f7a-4ae1-a0b3-f1679a52169e",
                  "name": "taskTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "c3a334f4-54cc-4d5d-9eab-57b38cf547b8",
                  "name": "opportunity"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "c8491082-fc5c-4bb3-aa45-5261b885a052",
              "type": "RELATION",
              "name": "noteTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Notes",
              "description": "Notes tied to the opportunity",
              "icon": "IconNotes",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "716f221d-8141-4c27-a049-d25b4fb5cfcc",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "897567d1-bee8-420d-8734-0a18459ea1d1",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "c8491082-fc5c-4bb3-aa45-5261b885a052",
                  "name": "noteTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "a3f31ecd-5923-442c-9cc0-cab8eff8d753",
                  "name": "opportunity"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "b7db4046-bb9e-4420-9cf9-d126a33301b4",
              "type": "RELATION",
              "name": "attachments",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Attachments",
              "description": "Attachments linked to the opportunity",
              "icon": "IconFileImport",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "716f221d-8141-4c27-a049-d25b4fb5cfcc",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "3001f4f9-fd3e-4403-8f1f-bc8a135e2619",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "b7db4046-bb9e-4420-9cf9-d126a33301b4",
                  "name": "attachments"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "cc254073-7a20-4c84-bae8-78533e40e3e7",
                  "name": "opportunity"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "fbe06e63-e424-45b4-971c-61f757fbce99",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Timeline Activities",
              "description": "Timeline Activities linked to the opportunity.",
              "icon": "IconTimelineEvent",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "716f221d-8141-4c27-a049-d25b4fb5cfcc",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "fbe06e63-e424-45b4-971c-61f757fbce99",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "9d68ee2d-3f47-4fbd-b590-356014175094",
                  "name": "opportunity"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "713fb75b-a43b-481d-b9eb-23e1705a1225",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "viewSort",
          "namePlural": "viewSorts",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "1844f85f-26cf-46b9-a613-3914f9e8d5cf",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "View Sort",
          "labelPlural": "View Sorts",
          "description": "(System) View Sorts",
          "icon": "IconArrowsSort",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "f96100aa-b8c9-4b80-ae41-e85fe5ef7572",
              "type": "UUID",
              "name": "fieldMetadataId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Field Metadata Id",
              "description": "View Sort target field",
              "icon": "IconTag"
            },
            {
              "__typename": "Field",
              "id": "09eab959-93eb-4807-974a-fbee1d885306",
              "type": "TEXT",
              "name": "direction",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'asc'",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Direction",
              "description": "View Sort direction",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "1844f85f-26cf-46b9-a613-3914f9e8d5cf",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "9bbd4f6f-e795-4e02-916b-60a0c4664e23",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "e923799b-680a-444f-b925-c42c9ae05d3a",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "a5a43107-9a4b-43af-8ee0-a0759de09329",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "0e43eca3-bc4e-4971-8f49-aa7f48ccd342",
              "type": "RELATION",
              "name": "view",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "viewId"
              },
              "isLabelSyncedWithName": false,
              "label": "View",
              "description": "View Sort related view",
              "icon": "IconLayoutCollage",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "713fb75b-a43b-481d-b9eb-23e1705a1225",
                  "nameSingular": "viewSort",
                  "namePlural": "viewSorts"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "93c079c7-1af4-4f0b-970a-cac536005231",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "0e43eca3-bc4e-4971-8f49-aa7f48ccd342",
                  "name": "view"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "9321b611-a889-4477-a949-9bc6ac5a407b",
                  "name": "viewSorts"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "favorite",
          "namePlural": "favorites",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "0b04e6f1-b216-4457-8bf3-d36ba24124d2",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Favorite",
          "labelPlural": "Favorites",
          "description": "A favorite that can be accessed from the left menu",
          "icon": "IconHeart",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "c0949420-32e9-4de4-92b2-90580057f930",
              "type": "NUMBER",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": 0,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Position",
              "description": "Favorite position",
              "icon": "IconList"
            },
            {
              "__typename": "Field",
              "id": "0b04e6f1-b216-4457-8bf3-d36ba24124d2",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "8ca36e45-4a14-492d-8681-52b740254391",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "7f3a21c1-5659-4bf4-8d23-e68b039ae4ee",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "cdc3e454-a3c9-4281-ac82-f0261c78c5c2",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "cf599863-b9e3-4cc2-a621-b19ae451ce8a",
              "type": "RELATION",
              "name": "note",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "noteId"
              },
              "isLabelSyncedWithName": false,
              "label": "Note",
              "description": "Favorite note",
              "icon": "IconNotes",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "65da8c99-e1a5-4130-86e8-ff4f79b1d6c8",
                  "nameSingular": "note",
                  "namePlural": "notes"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "cf599863-b9e3-4cc2-a621-b19ae451ce8a",
                  "name": "note"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "13a3ea99-d6f6-4835-b7ba-e01cdd545e0b",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "713d8325-0515-46cd-acd8-58be8c244ee0",
              "type": "RELATION",
              "name": "view",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "viewId"
              },
              "isLabelSyncedWithName": false,
              "label": "View",
              "description": "Favorite view",
              "icon": "IconLayoutCollage",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "93c079c7-1af4-4f0b-970a-cac536005231",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "713d8325-0515-46cd-acd8-58be8c244ee0",
                  "name": "view"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "95b757c5-d1c6-4eed-bbb5-e15c814df862",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "e9d6e9e9-db35-459b-9fa1-762bbf03483e",
              "type": "RELATION",
              "name": "forWorkspaceMember",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "forWorkspaceMemberId"
              },
              "isLabelSyncedWithName": false,
              "label": "Workspace Member",
              "description": "Favorite workspace member",
              "icon": "IconCircleUser",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "5821980a-4c2e-455c-8bb6-1a1eb0bf2b36",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "e9d6e9e9-db35-459b-9fa1-762bbf03483e",
                  "name": "forWorkspaceMember"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "2d21e1ef-f2f8-46f1-a868-a9d1abd9c073",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "74327138-d0ce-4feb-a817-0acf8caf0e98",
              "type": "RELATION",
              "name": "person",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "personId"
              },
              "isLabelSyncedWithName": false,
              "label": "Person",
              "description": "Favorite person",
              "icon": "IconUser",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "5926b097-a8a9-4baa-a001-fa7034aad925",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "74327138-d0ce-4feb-a817-0acf8caf0e98",
                  "name": "person"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "3d0e35f7-bf21-4353-b0c5-2007254a92a8",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "0c62ebc8-6af8-4995-913d-6101dfcc8b21",
              "type": "RELATION",
              "name": "company",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "companyId"
              },
              "isLabelSyncedWithName": false,
              "label": "Company",
              "description": "Favorite company",
              "icon": "IconBuildingSkyscraper",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "8ceca214-6ae0-4eb4-806f-dae127ca6f9b",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "0c62ebc8-6af8-4995-913d-6101dfcc8b21",
                  "name": "company"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "e63fa485-a5dd-41dc-b5de-5a0c234571c9",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "782291b4-6a60-4454-9232-ba141ea1623d",
              "type": "RELATION",
              "name": "favoriteFolder",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "SET_NULL",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "favoriteFolderId"
              },
              "isLabelSyncedWithName": false,
              "label": "Favorite Folder",
              "description": "The folder this favorite belongs to",
              "icon": "IconFolder",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "22766eba-2fc8-496f-b1b0-732b4a4e55ab",
                  "nameSingular": "favoriteFolder",
                  "namePlural": "favoriteFolders"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "782291b4-6a60-4454-9232-ba141ea1623d",
                  "name": "favoriteFolder"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "c0bcfdc9-fd1a-4fa1-a6ed-b441f04544de",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "257c4f8f-da83-4fd7-b7c7-a281af98b703",
              "type": "RELATION",
              "name": "opportunity",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "opportunityId"
              },
              "isLabelSyncedWithName": false,
              "label": "Opportunity",
              "description": "Favorite opportunity",
              "icon": "IconTargetArrow",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "716f221d-8141-4c27-a049-d25b4fb5cfcc",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "257c4f8f-da83-4fd7-b7c7-a281af98b703",
                  "name": "opportunity"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "5fa6a112-9c4b-4bd3-bd95-1450bdda8419",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "f35cb9ad-bbb6-4775-9902-9d00d28dfb6d",
              "type": "RELATION",
              "name": "workflow",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "workflowId"
              },
              "isLabelSyncedWithName": false,
              "label": "Workflow",
              "description": "Favorite workflow",
              "icon": "IconSettingsAutomation",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "9c5ae6bd-a403-4769-a50b-9953e6f5113b",
                  "nameSingular": "workflow",
                  "namePlural": "workflows"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "f35cb9ad-bbb6-4775-9902-9d00d28dfb6d",
                  "name": "workflow"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "4adbeb63-d401-483f-8930-cd1aa53f55cb",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "d3b390a4-5e64-44dc-a8b4-4c8e7d3ba7bc",
              "type": "RELATION",
              "name": "workflowVersion",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "workflowVersionId"
              },
              "isLabelSyncedWithName": false,
              "label": "Workflow",
              "description": "Favorite workflow version",
              "icon": "IconSettingsAutomation",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "fed7d356-a8b2-4861-8624-2f48b6358d37",
                  "nameSingular": "workflowVersion",
                  "namePlural": "workflowVersions"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "d3b390a4-5e64-44dc-a8b4-4c8e7d3ba7bc",
                  "name": "workflowVersion"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "39d672b7-d6ea-415d-a680-eb56b2883a8f",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "a97bfc69-7a72-413c-b904-cf0972637deb",
              "type": "RELATION",
              "name": "workflowRun",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "workflowRunId"
              },
              "isLabelSyncedWithName": false,
              "label": "Workflow",
              "description": "Favorite workflow run",
              "icon": "IconSettingsAutomation",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "3fe7df0e-03c0-40e9-8242-bb475c9be8fb",
                  "nameSingular": "workflowRun",
                  "namePlural": "workflowRuns"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "a97bfc69-7a72-413c-b904-cf0972637deb",
                  "name": "workflowRun"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "0d7b9ed2-70dd-4d2e-89d3-119a8e1bc749",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "2ad66d24-0475-4e56-805b-d2fb7978e9e5",
              "type": "RELATION",
              "name": "task",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "taskId"
              },
              "isLabelSyncedWithName": false,
              "label": "Task",
              "description": "Favorite task",
              "icon": "IconCheckbox",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "8d1b6c82-bb07-4c00-9b21-19caa65ae99d",
                  "nameSingular": "task",
                  "namePlural": "tasks"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "2ad66d24-0475-4e56-805b-d2fb7978e9e5",
                  "name": "task"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "79f9cbcc-154b-4274-84af-644a6c53d879",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "37fbb14b-25ea-45db-80b3-b45407107c90",
              "type": "RELATION",
              "name": "pet",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:03.601Z",
              "updatedAt": "2025-06-06T14:43:03.601Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "petId"
              },
              "isLabelSyncedWithName": false,
              "label": "Pet",
              "description": "Favorites Pet",
              "icon": "IconBuildingSkyscraper",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "d2a824df-b1a7-421b-a1c4-e2488bf580b9",
                  "nameSingular": "pet",
                  "namePlural": "pets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "37fbb14b-25ea-45db-80b3-b45407107c90",
                  "name": "pet"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "2bc4877d-f902-4c12-bbf7-64e525eafee5",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "e8253655-c89d-4f24-aa54-68a36e627240",
              "type": "RELATION",
              "name": "surveyResult",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:07.817Z",
              "updatedAt": "2025-06-06T14:43:07.817Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "surveyResultId"
              },
              "isLabelSyncedWithName": false,
              "label": "Survey result",
              "description": "Favorites Survey result",
              "icon": "IconBuildingSkyscraper",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "154570b7-3d4f-401d-ab7f-748903f1be28",
                  "nameSingular": "surveyResult",
                  "namePlural": "surveyResults"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "e8253655-c89d-4f24-aa54-68a36e627240",
                  "name": "surveyResult"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "b3e73ff1-e71e-473b-94c0-8438737f5992",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "fa347313-1a30-4a2e-92aa-3f64a93a26f6",
              "type": "RELATION",
              "name": "rocket",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:02.073Z",
              "updatedAt": "2025-06-06T14:43:02.073Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "rocketId"
              },
              "isLabelSyncedWithName": false,
              "label": "Rocket",
              "description": "Favorites Rocket",
              "icon": "IconBuildingSkyscraper",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "0ae004b8-8489-4f02-b54a-b3b123e3db9f",
                  "nameSingular": "rocket",
                  "namePlural": "rockets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "fa347313-1a30-4a2e-92aa-3f64a93a26f6",
                  "name": "rocket"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "bb3fed9e-50d6-4ad8-ada2-2fe4db034938",
                  "name": "favorites"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "timelineActivity",
          "namePlural": "timelineActivities",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "50460021-0a27-4c94-ab8b-151e4ed34518",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Timeline Activity",
          "labelPlural": "Timeline Activities",
          "description": "Aggregated / filtered event to be displayed on the timeline",
          "icon": "IconTimelineEvent",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "02dc62fb-cd47-45d3-af47-17fd097d8bad",
              "type": "DATE_TIME",
              "name": "happensAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "f5be55cb-9cec-4a3b-9beb-34b9fb8c1195",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Event name",
              "description": "Event name",
              "icon": "IconAbc"
            },
            {
              "__typename": "Field",
              "id": "fc577fa6-acd4-4e82-9520-bc5da9164ba6",
              "type": "RAW_JSON",
              "name": "properties",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Event details",
              "description": "Json value for event details",
              "icon": "IconListDetails"
            },
            {
              "__typename": "Field",
              "id": "61d7f6bd-0622-4997-9857-69b21a2817b3",
              "type": "TEXT",
              "name": "linkedRecordCachedName",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Linked Record cached name",
              "description": "Cached record name",
              "icon": "IconAbc"
            },
            {
              "__typename": "Field",
              "id": "9c12594c-e373-4259-8545-ec1cbc0fded9",
              "type": "UUID",
              "name": "linkedRecordId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Linked Record id",
              "description": "Linked Record id",
              "icon": "IconAbc"
            },
            {
              "__typename": "Field",
              "id": "1ef2eb02-0dba-47a8-b127-dd7ad141b154",
              "type": "UUID",
              "name": "linkedObjectMetadataId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Linked Object Metadata Id",
              "description": "Linked Object Metadata Id",
              "icon": "IconAbc"
            },
            {
              "__typename": "Field",
              "id": "50460021-0a27-4c94-ab8b-151e4ed34518",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "35f8896a-17d1-44db-9331-b3868f0b8d42",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "2102e3b7-513d-433d-8575-7625f1083236",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "50652515-8465-4e3f-a12d-c761cd82272a",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "06055444-8e91-4e16-8cf5-4ba399c0592a",
              "type": "RELATION",
              "name": "workspaceMember",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "workspaceMemberId"
              },
              "isLabelSyncedWithName": false,
              "label": "Workspace Member",
              "description": "Event workspace member",
              "icon": "IconCircleUser",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "5821980a-4c2e-455c-8bb6-1a1eb0bf2b36",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "06055444-8e91-4e16-8cf5-4ba399c0592a",
                  "name": "workspaceMember"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "0afae0ce-e304-45c8-9b73-166cf7accfb5",
                  "name": "timelineActivities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "b846a9eb-f552-40d8-9779-0cf1d52c1640",
              "type": "RELATION",
              "name": "person",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "personId"
              },
              "isLabelSyncedWithName": false,
              "label": "Person",
              "description": "Event person",
              "icon": "IconUser",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "5926b097-a8a9-4baa-a001-fa7034aad925",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "b846a9eb-f552-40d8-9779-0cf1d52c1640",
                  "name": "person"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "f72fcce8-1e57-4e82-bf62-852528c3e17d",
                  "name": "timelineActivities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "0067a473-4b97-4a49-ba9e-9ec9a614ae99",
              "type": "RELATION",
              "name": "company",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "companyId"
              },
              "isLabelSyncedWithName": false,
              "label": "Company",
              "description": "Event company",
              "icon": "IconBuildingSkyscraper",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "8ceca214-6ae0-4eb4-806f-dae127ca6f9b",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "0067a473-4b97-4a49-ba9e-9ec9a614ae99",
                  "name": "company"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "162de979-563c-4860-9923-e634a28ac907",
                  "name": "timelineActivities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "9d68ee2d-3f47-4fbd-b590-356014175094",
              "type": "RELATION",
              "name": "opportunity",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "SET_NULL",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "opportunityId"
              },
              "isLabelSyncedWithName": false,
              "label": "Opportunity",
              "description": "Event opportunity",
              "icon": "IconTargetArrow",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "716f221d-8141-4c27-a049-d25b4fb5cfcc",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "9d68ee2d-3f47-4fbd-b590-356014175094",
                  "name": "opportunity"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "fbe06e63-e424-45b4-971c-61f757fbce99",
                  "name": "timelineActivities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "d32e85cb-86f0-4cf3-9f6a-9b6591f4a563",
              "type": "RELATION",
              "name": "note",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "SET_NULL",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "noteId"
              },
              "isLabelSyncedWithName": false,
              "label": "Note",
              "description": "Event note",
              "icon": "IconTargetArrow",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "65da8c99-e1a5-4130-86e8-ff4f79b1d6c8",
                  "nameSingular": "note",
                  "namePlural": "notes"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "d32e85cb-86f0-4cf3-9f6a-9b6591f4a563",
                  "name": "note"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "ef5da898-c9be-45dc-98f8-7213ad91a9bc",
                  "name": "timelineActivities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "84338e52-0a4f-451c-a2dd-aec65324b584",
              "type": "RELATION",
              "name": "task",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "SET_NULL",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "taskId"
              },
              "isLabelSyncedWithName": false,
              "label": "Task",
              "description": "Event task",
              "icon": "IconTargetArrow",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "8d1b6c82-bb07-4c00-9b21-19caa65ae99d",
                  "nameSingular": "task",
                  "namePlural": "tasks"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "84338e52-0a4f-451c-a2dd-aec65324b584",
                  "name": "task"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "b11123f5-443c-4934-b41b-3438eeaac3c0",
                  "name": "timelineActivities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "5e94f750-d406-4c00-a637-6c646eb93901",
              "type": "RELATION",
              "name": "workflow",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "workflowId"
              },
              "isLabelSyncedWithName": false,
              "label": "Workflow",
              "description": "Event workflow",
              "icon": "IconTargetArrow",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "9c5ae6bd-a403-4769-a50b-9953e6f5113b",
                  "nameSingular": "workflow",
                  "namePlural": "workflows"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "5e94f750-d406-4c00-a637-6c646eb93901",
                  "name": "workflow"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "fe236d65-c893-486e-90d0-f8689df40b0b",
                  "name": "timelineActivities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "01e9e2ac-d69f-43ac-bfba-7e5c41892f57",
              "type": "RELATION",
              "name": "workflowVersion",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "workflowVersionId"
              },
              "isLabelSyncedWithName": false,
              "label": "WorkflowVersion",
              "description": "Event workflow version",
              "icon": "IconTargetArrow",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "fed7d356-a8b2-4861-8624-2f48b6358d37",
                  "nameSingular": "workflowVersion",
                  "namePlural": "workflowVersions"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "01e9e2ac-d69f-43ac-bfba-7e5c41892f57",
                  "name": "workflowVersion"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "19a930cf-736a-488d-b56d-9a919a0225fe",
                  "name": "timelineActivities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "163525a2-5edd-4934-9d9c-14e665c1412b",
              "type": "RELATION",
              "name": "workflowRun",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "workflowRunId"
              },
              "isLabelSyncedWithName": false,
              "label": "Workflow Run",
              "description": "Event workflow run",
              "icon": "IconTargetArrow",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "3fe7df0e-03c0-40e9-8242-bb475c9be8fb",
                  "nameSingular": "workflowRun",
                  "namePlural": "workflowRuns"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "163525a2-5edd-4934-9d9c-14e665c1412b",
                  "name": "workflowRun"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "c578c7e9-0903-4b1a-a759-63b7c362d8ee",
                  "name": "timelineActivities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "de1447e4-f7fc-4140-9368-3b694d361a62",
              "type": "RELATION",
              "name": "rocket",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:02.064Z",
              "updatedAt": "2025-06-06T14:43:02.064Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "rocketId"
              },
              "isLabelSyncedWithName": false,
              "label": "Rocket",
              "description": "TimelineActivities Rocket",
              "icon": "IconBuildingSkyscraper",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "0ae004b8-8489-4f02-b54a-b3b123e3db9f",
                  "nameSingular": "rocket",
                  "namePlural": "rockets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "de1447e4-f7fc-4140-9368-3b694d361a62",
                  "name": "rocket"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "3282b9fb-1316-4c13-9b9d-3423e6b287f0",
                  "name": "timelineActivities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "153feaf4-66bf-4155-aed9-0e7dc77b9ef1",
              "type": "RELATION",
              "name": "pet",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:03.614Z",
              "updatedAt": "2025-06-06T14:43:03.614Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "petId"
              },
              "isLabelSyncedWithName": false,
              "label": "Pet",
              "description": "TimelineActivities Pet",
              "icon": "IconBuildingSkyscraper",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "d2a824df-b1a7-421b-a1c4-e2488bf580b9",
                  "nameSingular": "pet",
                  "namePlural": "pets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "153feaf4-66bf-4155-aed9-0e7dc77b9ef1",
                  "name": "pet"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "13506640-485d-41fc-9441-8012732f7ed8",
                  "name": "timelineActivities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "646fc7e8-a640-4183-a204-eea9eccd0dfb",
              "type": "RELATION",
              "name": "surveyResult",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:07.816Z",
              "updatedAt": "2025-06-06T14:43:07.816Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "surveyResultId"
              },
              "isLabelSyncedWithName": false,
              "label": "Survey result",
              "description": "TimelineActivities Survey result",
              "icon": "IconBuildingSkyscraper",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "154570b7-3d4f-401d-ab7f-748903f1be28",
                  "nameSingular": "surveyResult",
                  "namePlural": "surveyResults"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "646fc7e8-a640-4183-a204-eea9eccd0dfb",
                  "name": "surveyResult"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "10a286d9-eb71-4b6a-8964-8f17f3a34ff9",
                  "name": "timelineActivities"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "65da8c99-e1a5-4130-86e8-ff4f79b1d6c8",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "note",
          "namePlural": "notes",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": false,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "bf246680-abd8-484e-a027-552c755e9aeb",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": "N",
          "isLabelSyncedWithName": false,
          "isSearchable": true,
          "duplicateCriteria": null,
          "labelSingular": "Note",
          "labelPlural": "Notes",
          "description": "A note",
          "icon": "IconNotes",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "IndexEdge",
                "node": {
                  "__typename": "Index",
                  "id": "65d1df91-a4cd-4b83-9b09-5f375de2d4ad",
                  "createdAt": "2025-06-06T14:42:51.895Z",
                  "updatedAt": "2025-06-06T14:42:51.895Z",
                  "name": "IDX_f20de8d7fc74a405e4083051275",
                  "indexWhereClause": null,
                  "indexType": "GIN",
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "IndexFieldEdge",
                        "node": {
                          "__typename": "IndexField",
                          "id": "372626fe-4b69-4bb4-844f-236b6f9283f4",
                          "createdAt": "2025-06-06T14:42:51.895Z",
                          "updatedAt": "2025-06-06T14:42:51.895Z",
                          "order": 0,
                          "fieldMetadataId": "b4656a0f-4601-4cf9-829e-9be4d0ce353f"
                        }
                      }
                    ]
                  }
                }
              }
            ]
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "5f0087d4-0a08-40cf-bdf1-414275e008c4",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "9846118d-6772-419f-a4b9-4265eb2668b5",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "2eac5fd9-974f-4731-aee1-8c27177e3283",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": 0,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Position",
              "description": "Note record position",
              "icon": "IconHierarchy2"
            },
            {
              "__typename": "Field",
              "id": "bf246680-abd8-484e-a027-552c755e9aeb",
              "type": "TEXT",
              "name": "title",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Title",
              "description": "Note title",
              "icon": "IconNotes"
            },
            {
              "__typename": "Field",
              "id": "43be860b-cdbb-4b5a-878d-dc7c0aa71f95",
              "type": "RICH_TEXT",
              "name": "body",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Body (deprecated)",
              "description": "Note body",
              "icon": "IconFilePencil"
            },
            {
              "__typename": "Field",
              "id": "76ad144b-16e5-4119-b068-b6647d42cb0a",
              "type": "RICH_TEXT_V2",
              "name": "bodyV2",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": {
                "markdown": "''",
                "blocknote": "''"
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Body",
              "description": "Note body",
              "icon": "IconFilePencil"
            },
            {
              "__typename": "Field",
              "id": "71984e77-0be6-471a-a520-521b3f461595",
              "type": "ACTOR",
              "name": "createdBy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": {
                "name": "'System'",
                "source": "'MANUAL'",
                "context": {}
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Created by",
              "description": "The creator of the record",
              "icon": "IconCreativeCommonsSa"
            },
            {
              "__typename": "Field",
              "id": "b4656a0f-4601-4cf9-829e-9be4d0ce353f",
              "type": "TS_VECTOR",
              "name": "searchVector",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Search vector",
              "description": "Field used for full-text search",
              "icon": "IconUser"
            },
            {
              "__typename": "Field",
              "id": "6ef67ef6-a63e-419c-8cd1-ff35bdc5c60a",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "931e6b29-cf37-4c31-aaf6-5474d883ebab",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "6618010c-2435-4b84-8a8e-c10ae9b91ecd",
              "type": "RELATION",
              "name": "noteTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Relations",
              "description": "Note targets",
              "icon": "IconArrowUpRight",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "65da8c99-e1a5-4130-86e8-ff4f79b1d6c8",
                  "nameSingular": "note",
                  "namePlural": "notes"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "897567d1-bee8-420d-8734-0a18459ea1d1",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "6618010c-2435-4b84-8a8e-c10ae9b91ecd",
                  "name": "noteTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "d1f06b62-13dc-4c68-95a2-cc1a8032947c",
                  "name": "note"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "99658dad-d108-4781-8b16-f2eaecf3c51f",
              "type": "RELATION",
              "name": "attachments",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Attachments",
              "description": "Note attachments",
              "icon": "IconFileImport",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "65da8c99-e1a5-4130-86e8-ff4f79b1d6c8",
                  "nameSingular": "note",
                  "namePlural": "notes"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "3001f4f9-fd3e-4403-8f1f-bc8a135e2619",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "99658dad-d108-4781-8b16-f2eaecf3c51f",
                  "name": "attachments"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "e50d63fe-1125-4309-9f40-2b6b79663cb6",
                  "name": "note"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "ef5da898-c9be-45dc-98f8-7213ad91a9bc",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Timeline Activities",
              "description": "Timeline Activities linked to the note.",
              "icon": "IconTimelineEvent",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "65da8c99-e1a5-4130-86e8-ff4f79b1d6c8",
                  "nameSingular": "note",
                  "namePlural": "notes"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "ef5da898-c9be-45dc-98f8-7213ad91a9bc",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "d32e85cb-86f0-4cf3-9f6a-9b6591f4a563",
                  "name": "note"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "13a3ea99-d6f6-4835-b7ba-e01cdd545e0b",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Favorites",
              "description": "Favorites linked to the note",
              "icon": "IconHeart",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "65da8c99-e1a5-4130-86e8-ff4f79b1d6c8",
                  "nameSingular": "note",
                  "namePlural": "notes"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "13a3ea99-d6f6-4835-b7ba-e01cdd545e0b",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "cf599863-b9e3-4cc2-a621-b19ae451ce8a",
                  "name": "note"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "5926b097-a8a9-4baa-a001-fa7034aad925",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "person",
          "namePlural": "people",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": false,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "ae2da6c0-4186-4d46-b09d-bf15e1632d8e",
          "imageIdentifierFieldMetadataId": "5cdf08ea-fc02-40b4-978f-8949e87cbe26",
          "shortcut": "P",
          "isLabelSyncedWithName": false,
          "isSearchable": true,
          "duplicateCriteria": [
            [
              "nameFirstName",
              "nameLastName"
            ],
            [
              "linkedinLinkPrimaryLinkUrl"
            ],
            [
              "emailsPrimaryEmail"
            ]
          ],
          "labelSingular": "Person",
          "labelPlural": "People",
          "description": "A person",
          "icon": "IconUser",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "IndexEdge",
                "node": {
                  "__typename": "Index",
                  "id": "1c8d513a-0793-4a59-abc5-2af952c5e107",
                  "createdAt": "2025-06-06T14:42:51.895Z",
                  "updatedAt": "2025-06-06T14:42:51.895Z",
                  "name": "IDX_bbd7aec1976fc684a0a5e4816c9",
                  "indexWhereClause": null,
                  "indexType": "GIN",
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "IndexFieldEdge",
                        "node": {
                          "__typename": "IndexField",
                          "id": "a6552fe5-43d5-4ad6-bdeb-728b3094518c",
                          "createdAt": "2025-06-06T14:42:51.895Z",
                          "updatedAt": "2025-06-06T14:42:51.895Z",
                          "order": 0,
                          "fieldMetadataId": "c3b05ed0-c465-44c1-8035-d357bfa9adb3"
                        }
                      }
                    ]
                  }
                }
              },
              {
                "__typename": "IndexEdge",
                "node": {
                  "__typename": "Index",
                  "id": "69597f8e-895b-4fc0-b4ea-1d43745ef2f9",
                  "createdAt": "2025-06-06T14:42:51.895Z",
                  "updatedAt": "2025-06-06T14:42:51.895Z",
                  "name": "IDX_UNIQUE_87914cd3ce963115f8cb943e2ac",
                  "indexWhereClause": null,
                  "indexType": "BTREE",
                  "isUnique": true,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "IndexFieldEdge",
                        "node": {
                          "__typename": "IndexField",
                          "id": "815c5ce9-c95c-46ac-a062-b7377de5ba17",
                          "createdAt": "2025-06-06T14:42:51.895Z",
                          "updatedAt": "2025-06-06T14:42:51.895Z",
                          "order": 0,
                          "fieldMetadataId": "f3bcc84e-c01c-439d-a845-774c904e7fb6"
                        }
                      }
                    ]
                  }
                }
              }
            ]
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "ae2da6c0-4186-4d46-b09d-bf15e1632d8e",
              "type": "FULL_NAME",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": {
                "lastName": "''",
                "firstName": "''"
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Name",
              "description": "Contact’s name",
              "icon": "IconUser"
            },
            {
              "__typename": "Field",
              "id": "f3bcc84e-c01c-439d-a845-774c904e7fb6",
              "type": "EMAILS",
              "name": "emails",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": true,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": {
                "primaryEmail": "''",
                "additionalEmails": null
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Emails",
              "description": "Contact’s Emails",
              "icon": "IconMail"
            },
            {
              "__typename": "Field",
              "id": "774e818d-a307-4d52-bc12-f85a7c5a632c",
              "type": "LINKS",
              "name": "linkedinLink",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": {
                "primaryLinkUrl": "''",
                "secondaryLinks": "'[]'",
                "primaryLinkLabel": "''"
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Linkedin",
              "description": "Contact’s Linkedin account",
              "icon": "IconBrandLinkedin"
            },
            {
              "__typename": "Field",
              "id": "a726a423-5da3-425b-a4b0-c5e588fb19bf",
              "type": "LINKS",
              "name": "xLink",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": {
                "primaryLinkUrl": "''",
                "secondaryLinks": "'[]'",
                "primaryLinkLabel": "''"
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "X",
              "description": "Contact’s X/Twitter account",
              "icon": "IconBrandX"
            },
            {
              "__typename": "Field",
              "id": "db98a82c-9283-4c30-a969-a8b0b3435056",
              "type": "TEXT",
              "name": "jobTitle",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Job Title",
              "description": "Contact’s job title",
              "icon": "IconBriefcase"
            },
            {
              "__typename": "Field",
              "id": "9b19a90e-63ab-4878-9948-4526f67d9647",
              "type": "PHONES",
              "name": "phones",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": {
                "additionalPhones": null,
                "primaryPhoneNumber": "''",
                "primaryPhoneCallingCode": "''",
                "primaryPhoneCountryCode": "''"
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Phones",
              "description": "Contact’s phone numbers",
              "icon": "IconPhone"
            },
            {
              "__typename": "Field",
              "id": "da9520f5-57c6-4c01-8bae-e49024f23325",
              "type": "TEXT",
              "name": "city",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "City",
              "description": "Contact’s city",
              "icon": "IconMap"
            },
            {
              "__typename": "Field",
              "id": "5cdf08ea-fc02-40b4-978f-8949e87cbe26",
              "type": "TEXT",
              "name": "avatarUrl",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Avatar",
              "description": "Contact’s avatar",
              "icon": "IconFileUpload"
            },
            {
              "__typename": "Field",
              "id": "3031e1fe-7409-4ed4-8479-ff310c6b9e69",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": 0,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Position",
              "description": "Person record Position",
              "icon": "IconHierarchy2"
            },
            {
              "__typename": "Field",
              "id": "aefa7994-feb3-4de0-8911-c997aa10f686",
              "type": "ACTOR",
              "name": "createdBy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": {
                "name": "'System'",
                "source": "'MANUAL'",
                "context": {}
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Created by",
              "description": "The creator of the record",
              "icon": "IconCreativeCommonsSa"
            },
            {
              "__typename": "Field",
              "id": "c3b05ed0-c465-44c1-8035-d357bfa9adb3",
              "type": "TS_VECTOR",
              "name": "searchVector",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Search vector",
              "description": "Field used for full-text search",
              "icon": "IconUser"
            },
            {
              "__typename": "Field",
              "id": "81f1e301-22a0-423e-aaaa-09c78c8b4a79",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "5f928740-df4f-41a3-8d66-c203123bd879",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "a10d4653-aafe-4f7a-9c8b-1c6a797ec3d7",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "9aa61e88-ea2a-4b0d-a49d-3296a182d814",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "3fcd2494-bdbe-461a-b48b-d26e7de21a1f",
              "type": "RELATION",
              "name": "company",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "SET_NULL",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "companyId"
              },
              "isLabelSyncedWithName": false,
              "label": "Company",
              "description": "Contact’s company",
              "icon": "IconBuildingSkyscraper",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "5926b097-a8a9-4baa-a001-fa7034aad925",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "8ceca214-6ae0-4eb4-806f-dae127ca6f9b",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "3fcd2494-bdbe-461a-b48b-d26e7de21a1f",
                  "name": "company"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "258b9e2e-b63d-42f6-bd14-1891fdad7f1b",
                  "name": "people"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "25e69274-6bb5-427d-9995-a07472eea272",
              "type": "RELATION",
              "name": "pointOfContactForOpportunities",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Linked Opportunities",
              "description": "List of opportunities for which that person is the point of contact",
              "icon": "IconTargetArrow",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "5926b097-a8a9-4baa-a001-fa7034aad925",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "716f221d-8141-4c27-a049-d25b4fb5cfcc",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "25e69274-6bb5-427d-9995-a07472eea272",
                  "name": "pointOfContactForOpportunities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "d06f5cf6-01cc-460f-a9d9-ddf3516c2977",
                  "name": "pointOfContact"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "d2455cb3-da00-4a58-8010-b2679aef228b",
              "type": "RELATION",
              "name": "taskTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Tasks",
              "description": "Tasks tied to the contact",
              "icon": "IconCheckbox",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "5926b097-a8a9-4baa-a001-fa7034aad925",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4abbd2fa-de1a-4f59-b5dd-3c51023b9003",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "d2455cb3-da00-4a58-8010-b2679aef228b",
                  "name": "taskTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "2909e9f9-79f9-4412-b91f-d092aa0f129c",
                  "name": "person"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "f3c612aa-0ad7-4070-b003-0b9bb9b93c28",
              "type": "RELATION",
              "name": "noteTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Notes",
              "description": "Notes tied to the contact",
              "icon": "IconNotes",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "5926b097-a8a9-4baa-a001-fa7034aad925",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "897567d1-bee8-420d-8734-0a18459ea1d1",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "f3c612aa-0ad7-4070-b003-0b9bb9b93c28",
                  "name": "noteTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "2a27ce65-0cfb-4676-a08f-6ed7d92e15fc",
                  "name": "person"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "3d0e35f7-bf21-4353-b0c5-2007254a92a8",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Favorites",
              "description": "Favorites linked to the contact",
              "icon": "IconHeart",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "5926b097-a8a9-4baa-a001-fa7034aad925",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "3d0e35f7-bf21-4353-b0c5-2007254a92a8",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "74327138-d0ce-4feb-a817-0acf8caf0e98",
                  "name": "person"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "cc75a9c1-f240-4e49-b56d-e0a8b5f73363",
              "type": "RELATION",
              "name": "attachments",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Attachments",
              "description": "Attachments linked to the contact.",
              "icon": "IconFileImport",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "5926b097-a8a9-4baa-a001-fa7034aad925",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "3001f4f9-fd3e-4403-8f1f-bc8a135e2619",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "cc75a9c1-f240-4e49-b56d-e0a8b5f73363",
                  "name": "attachments"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "e117cd57-c941-4321-9315-2be5aadf94b1",
                  "name": "person"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "cf8ed2bc-b209-4e83-87a7-810c66e0ea93",
              "type": "RELATION",
              "name": "messageParticipants",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Message Participants",
              "description": "Message Participants",
              "icon": "IconUserCircle",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "5926b097-a8a9-4baa-a001-fa7034aad925",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "8815db3a-6b82-42b3-ab0c-e7452efc0d65",
                  "nameSingular": "messageParticipant",
                  "namePlural": "messageParticipants"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "cf8ed2bc-b209-4e83-87a7-810c66e0ea93",
                  "name": "messageParticipants"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "eddd7f28-8dfc-4c53-baf2-8fa86b86c2a9",
                  "name": "person"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "a8167739-c784-4597-9a6c-e2f42b8649c7",
              "type": "RELATION",
              "name": "calendarEventParticipants",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Calendar Event Participants",
              "description": "Calendar Event Participants",
              "icon": "IconCalendar",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "5926b097-a8a9-4baa-a001-fa7034aad925",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "d5a6519c-0d38-4156-9993-8ccb4fb26812",
                  "nameSingular": "calendarEventParticipant",
                  "namePlural": "calendarEventParticipants"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "a8167739-c784-4597-9a6c-e2f42b8649c7",
                  "name": "calendarEventParticipants"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "83c1c8a0-a1a2-4b12-a6a8-4472810c6b7f",
                  "name": "person"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "f72fcce8-1e57-4e82-bf62-852528c3e17d",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Events",
              "description": "Events linked to the person",
              "icon": "IconTimelineEvent",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "5926b097-a8a9-4baa-a001-fa7034aad925",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "f72fcce8-1e57-4e82-bf62-852528c3e17d",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "b846a9eb-f552-40d8-9779-0cf1d52c1640",
                  "name": "person"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "5821980a-4c2e-455c-8bb6-1a1eb0bf2b36",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "workspaceMember",
          "namePlural": "workspaceMembers",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "411d6c11-2054-4596-b9d4-4644d7936c53",
          "imageIdentifierFieldMetadataId": "c1b2b70f-a91b-48f0-8824-07893b8b1a6a",
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": true,
          "duplicateCriteria": null,
          "labelSingular": "Workspace Member",
          "labelPlural": "Workspace Members",
          "description": "A workspace member",
          "icon": "IconUserCircle",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "IndexEdge",
                "node": {
                  "__typename": "Index",
                  "id": "955217f3-ced0-41b7-abc4-bd961bfaa974",
                  "createdAt": "2025-06-06T14:42:51.895Z",
                  "updatedAt": "2025-06-06T14:42:51.895Z",
                  "name": "IDX_e47451872f70c8f187a6b460ac7",
                  "indexWhereClause": null,
                  "indexType": "GIN",
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "IndexFieldEdge",
                        "node": {
                          "__typename": "IndexField",
                          "id": "0749a22e-0fa6-4a9e-9c3f-3f29dde59d2c",
                          "createdAt": "2025-06-06T14:42:51.895Z",
                          "updatedAt": "2025-06-06T14:42:51.895Z",
                          "order": 0,
                          "fieldMetadataId": "b98ec048-0039-484b-bf38-0df0f0dcdefe"
                        }
                      }
                    ]
                  }
                }
              }
            ]
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "e8fe92ae-f159-4859-b5fc-174705f61ac3",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": 0,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Position",
              "description": "Workspace member position",
              "icon": "IconHierarchy2"
            },
            {
              "__typename": "Field",
              "id": "411d6c11-2054-4596-b9d4-4644d7936c53",
              "type": "FULL_NAME",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": {
                "lastName": "''",
                "firstName": "''"
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Name",
              "description": "Workspace member name",
              "icon": "IconCircleUser"
            },
            {
              "__typename": "Field",
              "id": "3f80042d-81b4-4e8e-bfc4-a8f5d9cec773",
              "type": "TEXT",
              "name": "colorScheme",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'System'",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Color Scheme",
              "description": "Preferred color scheme",
              "icon": "IconColorSwatch"
            },
            {
              "__typename": "Field",
              "id": "d2e1d81c-9bfd-4f0c-982d-3cda5f5abb62",
              "type": "TEXT",
              "name": "locale",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'en'",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Language",
              "description": "Preferred language",
              "icon": "IconLanguage"
            },
            {
              "__typename": "Field",
              "id": "c1b2b70f-a91b-48f0-8824-07893b8b1a6a",
              "type": "TEXT",
              "name": "avatarUrl",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Avatar Url",
              "description": "Workspace member avatar",
              "icon": "IconFileUpload"
            },
            {
              "__typename": "Field",
              "id": "eb9de7ef-437a-4eee-b4ba-d9e4f9928f94",
              "type": "TEXT",
              "name": "userEmail",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "User Email",
              "description": "Related user email address",
              "icon": "IconMail"
            },
            {
              "__typename": "Field",
              "id": "2cde2bc8-c7e8-4f1b-8e81-4f1e918da3a8",
              "type": "UUID",
              "name": "userId",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "User Id",
              "description": "Associated User Id",
              "icon": "IconCircleUsers"
            },
            {
              "__typename": "Field",
              "id": "afb0ac21-39ba-4a81-86e1-92564e61eed5",
              "type": "TEXT",
              "name": "timeZone",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'system'",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Time zone",
              "description": "User time zone",
              "icon": "IconTimezone"
            },
            {
              "__typename": "Field",
              "id": "ccb0c333-a831-4df0-8a98-1db9e6f0d0a7",
              "type": "SELECT",
              "name": "dateFormat",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'SYSTEM'",
              "options": [
                {
                  "id": "0a537fc5-cb98-41f1-a9af-67fe0f39148b",
                  "color": "turquoise",
                  "label": "System",
                  "value": "SYSTEM",
                  "position": 0
                },
                {
                  "id": "c21b6ea5-6327-42ee-a4c9-23f7c409315c",
                  "color": "red",
                  "label": "Month First",
                  "value": "MONTH_FIRST",
                  "position": 1
                },
                {
                  "id": "a56d9d51-b089-4f2b-b914-107aec1e34ad",
                  "color": "purple",
                  "label": "Day First",
                  "value": "DAY_FIRST",
                  "position": 2
                },
                {
                  "id": "1f4356eb-95f1-4d13-ac28-a7ef8815a96a",
                  "color": "sky",
                  "label": "Year First",
                  "value": "YEAR_FIRST",
                  "position": 3
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Date format",
              "description": "User's preferred date format",
              "icon": "IconCalendarEvent"
            },
            {
              "__typename": "Field",
              "id": "a6a7771b-42d9-4f11-839d-2cafcd57e9dd",
              "type": "SELECT",
              "name": "timeFormat",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'SYSTEM'",
              "options": [
                {
                  "id": "54c39ded-c6e6-418c-bc58-6670f993ce96",
                  "color": "sky",
                  "label": "System",
                  "value": "SYSTEM",
                  "position": 0
                },
                {
                  "id": "373f469d-c801-4c57-8225-c8a50e7109d4",
                  "color": "red",
                  "label": "24HRS",
                  "value": "HOUR_24",
                  "position": 1
                },
                {
                  "id": "95779cc3-796f-4ca4-8567-38969ec31fc4",
                  "color": "purple",
                  "label": "12HRS",
                  "value": "HOUR_12",
                  "position": 2
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Time format",
              "description": "User's preferred time format",
              "icon": "IconClock2"
            },
            {
              "__typename": "Field",
              "id": "b98ec048-0039-484b-bf38-0df0f0dcdefe",
              "type": "TS_VECTOR",
              "name": "searchVector",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Search vector",
              "description": "Field used for full-text search",
              "icon": "IconUser"
            },
            {
              "__typename": "Field",
              "id": "b5d12288-698a-4b4c-92d7-fdf26bef6ca5",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "4dda7ee0-cb10-40f2-8e43-5a5a91fda6d9",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "53d68d67-0896-411d-af34-7ad062b7e342",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "d2f67280-0229-44cc-b6c4-114c4d1d0a9a",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "e03db82c-1940-44b0-869d-78ca451e7bcf",
              "type": "RELATION",
              "name": "assignedTasks",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Assigned tasks",
              "description": "Tasks assigned to the workspace member",
              "icon": "IconCheckbox",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "5821980a-4c2e-455c-8bb6-1a1eb0bf2b36",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "8d1b6c82-bb07-4c00-9b21-19caa65ae99d",
                  "nameSingular": "task",
                  "namePlural": "tasks"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "e03db82c-1940-44b0-869d-78ca451e7bcf",
                  "name": "assignedTasks"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "8b28fc1b-05c9-4676-84d0-f50ec8e20060",
                  "name": "assignee"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "2d21e1ef-f2f8-46f1-a868-a9d1abd9c073",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Favorites",
              "description": "Favorites linked to the workspace member",
              "icon": "IconHeart",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "5821980a-4c2e-455c-8bb6-1a1eb0bf2b36",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "2d21e1ef-f2f8-46f1-a868-a9d1abd9c073",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "e9d6e9e9-db35-459b-9fa1-762bbf03483e",
                  "name": "forWorkspaceMember"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "dcfdeeb5-905a-4832-a430-c28a2f6cdf8d",
              "type": "RELATION",
              "name": "accountOwnerForCompanies",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Account Owner For Companies",
              "description": "Account owner for companies",
              "icon": "IconBriefcase",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "5821980a-4c2e-455c-8bb6-1a1eb0bf2b36",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "8ceca214-6ae0-4eb4-806f-dae127ca6f9b",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "dcfdeeb5-905a-4832-a430-c28a2f6cdf8d",
                  "name": "accountOwnerForCompanies"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "d46783eb-ab42-47b6-bae4-014570218f7c",
                  "name": "accountOwner"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "cb37ce6c-18c0-445e-aa91-2ab1120f15d3",
              "type": "RELATION",
              "name": "authoredAttachments",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Authored attachments",
              "description": "Attachments created by the workspace member",
              "icon": "IconFileImport",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "5821980a-4c2e-455c-8bb6-1a1eb0bf2b36",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "3001f4f9-fd3e-4403-8f1f-bc8a135e2619",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "cb37ce6c-18c0-445e-aa91-2ab1120f15d3",
                  "name": "authoredAttachments"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "699ff27f-18eb-4c09-b9dc-543aa9fd2c46",
                  "name": "author"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "6418adc9-0867-467e-8779-2d8aa712e6c8",
              "type": "RELATION",
              "name": "connectedAccounts",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Connected accounts",
              "description": "Connected accounts",
              "icon": "IconAt",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "5821980a-4c2e-455c-8bb6-1a1eb0bf2b36",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "b275aa83-4488-464b-a6e4-b9b641630259",
                  "nameSingular": "connectedAccount",
                  "namePlural": "connectedAccounts"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "6418adc9-0867-467e-8779-2d8aa712e6c8",
                  "name": "connectedAccounts"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "b5e74424-be16-47a9-a99e-145d2ee885fa",
                  "name": "accountOwner"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "f7844018-284f-458b-bb6d-f6cab830c885",
              "type": "RELATION",
              "name": "messageParticipants",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Message Participants",
              "description": "Message Participants",
              "icon": "IconUserCircle",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "5821980a-4c2e-455c-8bb6-1a1eb0bf2b36",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "8815db3a-6b82-42b3-ab0c-e7452efc0d65",
                  "nameSingular": "messageParticipant",
                  "namePlural": "messageParticipants"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "f7844018-284f-458b-bb6d-f6cab830c885",
                  "name": "messageParticipants"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "f4254d58-4815-41a2-b034-18a6141827cb",
                  "name": "workspaceMember"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "0f4f76e5-915a-4c17-b937-88370475ffd4",
              "type": "RELATION",
              "name": "blocklist",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Blocklist",
              "description": "Blocklisted handles",
              "icon": "IconForbid2",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "5821980a-4c2e-455c-8bb6-1a1eb0bf2b36",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "fd87d0db-2975-4a99-b817-0d36a9b12c6e",
                  "nameSingular": "blocklist",
                  "namePlural": "blocklists"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "0f4f76e5-915a-4c17-b937-88370475ffd4",
                  "name": "blocklist"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "cbe57bf8-ef2e-4b17-bb86-a2a84a4ea78d",
                  "name": "workspaceMember"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "a0d7b244-699a-47d9-b3b3-4393a4505285",
              "type": "RELATION",
              "name": "calendarEventParticipants",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Calendar Event Participants",
              "description": "Calendar Event Participants",
              "icon": "IconCalendar",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "5821980a-4c2e-455c-8bb6-1a1eb0bf2b36",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "d5a6519c-0d38-4156-9993-8ccb4fb26812",
                  "nameSingular": "calendarEventParticipant",
                  "namePlural": "calendarEventParticipants"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "a0d7b244-699a-47d9-b3b3-4393a4505285",
                  "name": "calendarEventParticipants"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "f7c8bd9a-15b4-4eef-a408-c20fb5d5d7f5",
                  "name": "workspaceMember"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "0afae0ce-e304-45c8-9b73-166cf7accfb5",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Events",
              "description": "Events linked to the workspace member",
              "icon": "IconTimelineEvent",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "5821980a-4c2e-455c-8bb6-1a1eb0bf2b36",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "0afae0ce-e304-45c8-9b73-166cf7accfb5",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "06055444-8e91-4e16-8cf5-4ba399c0592a",
                  "name": "workspaceMember"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "4e245e5e-c2a1-43c3-9744-d39599d55ed1",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "workflowAutomatedTrigger",
          "namePlural": "workflowAutomatedTriggers",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "0b5a82c3-d171-4163-80cf-2754362f3851",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "WorkflowAutomatedTrigger",
          "labelPlural": "WorkflowAutomatedTriggers",
          "description": "A workflow automated trigger",
          "icon": "IconSettingsAutomation",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "11eeb607-0f96-406c-84d3-4fedaa03a604",
              "type": "SELECT",
              "name": "type",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": [
                {
                  "id": "b7c5e4b6-2b7e-4c2b-aa28-c864308277ae",
                  "color": "green",
                  "label": "Database Event",
                  "value": "DATABASE_EVENT",
                  "position": 0
                },
                {
                  "id": "58182594-835d-427c-86da-b962f25fa37c",
                  "color": "blue",
                  "label": "Cron",
                  "value": "CRON",
                  "position": 1
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Automated Trigger Type",
              "description": "The workflow automated trigger type",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "c2817286-eca3-4d50-9b2f-663e9014bf9e",
              "type": "RAW_JSON",
              "name": "settings",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Settings",
              "description": "The workflow automated trigger settings",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "0b5a82c3-d171-4163-80cf-2754362f3851",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "ce98f669-e0a0-4cf3-8c8b-d2d44b0a795b",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "ab42e8e3-cbf3-420d-b030-05ce949e45e2",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "51a87f6c-5a02-4c9f-bf51-c8924c7e161e",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "0c75cad9-05bb-4d18-82bd-6ec0a587549d",
              "type": "RELATION",
              "name": "workflow",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "workflowId"
              },
              "isLabelSyncedWithName": false,
              "label": "Workflow",
              "description": "WorkflowAutomatedTrigger workflow",
              "icon": "IconSettingsAutomation",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "4e245e5e-c2a1-43c3-9744-d39599d55ed1",
                  "nameSingular": "workflowAutomatedTrigger",
                  "namePlural": "workflowAutomatedTriggers"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "9c5ae6bd-a403-4769-a50b-9953e6f5113b",
                  "nameSingular": "workflow",
                  "namePlural": "workflows"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "0c75cad9-05bb-4d18-82bd-6ec0a587549d",
                  "name": "workflow"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "37a495e6-dbdf-4102-98d4-f45132c13430",
                  "name": "automatedTriggers"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "4ccdf309-8939-4852-ac6d-4a2691cde89e",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "messageChannel",
          "namePlural": "messageChannels",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "cf034707-d0af-4f23-97a4-22f475183d84",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Message Channel",
          "labelPlural": "Message Channels",
          "description": "Message Channels",
          "icon": "IconMessage",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "461c41f1-c0db-4ebd-85ef-b9a900749d01",
              "type": "SELECT",
              "name": "visibility",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'SHARE_EVERYTHING'",
              "options": [
                {
                  "id": "09c465b3-5eca-4916-b9eb-af5659930633",
                  "color": "green",
                  "label": "Metadata",
                  "value": "METADATA",
                  "position": 0
                },
                {
                  "id": "c0b0e9e0-1298-4252-9cd9-eb2bb375528e",
                  "color": "blue",
                  "label": "Subject",
                  "value": "SUBJECT",
                  "position": 1
                },
                {
                  "id": "dae0d67f-32fe-4ed8-8314-f831c8e8ee34",
                  "color": "orange",
                  "label": "Share Everything",
                  "value": "SHARE_EVERYTHING",
                  "position": 2
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Visibility",
              "description": "Visibility",
              "icon": "IconEyeglass"
            },
            {
              "__typename": "Field",
              "id": "cf034707-d0af-4f23-97a4-22f475183d84",
              "type": "TEXT",
              "name": "handle",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Handle",
              "description": "Handle",
              "icon": "IconAt"
            },
            {
              "__typename": "Field",
              "id": "731506d3-ae11-4e31-88f7-374698857af0",
              "type": "SELECT",
              "name": "type",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'email'",
              "options": [
                {
                  "id": "acdf0bc5-6d3d-4c75-87c8-93ecb3228fa3",
                  "color": "green",
                  "label": "Email",
                  "value": "email",
                  "position": 0
                },
                {
                  "id": "ce8d26b5-080b-49a0-a675-23388135da4f",
                  "color": "blue",
                  "label": "SMS",
                  "value": "sms",
                  "position": 1
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Type",
              "description": "Channel Type",
              "icon": "IconMessage"
            },
            {
              "__typename": "Field",
              "id": "46f3c417-ed15-4872-b814-f12213b0168b",
              "type": "BOOLEAN",
              "name": "isContactAutoCreationEnabled",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": true,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Is Contact Auto Creation Enabled",
              "description": "Is Contact Auto Creation Enabled",
              "icon": "IconUserCircle"
            },
            {
              "__typename": "Field",
              "id": "4246a241-c2ca-4b9f-b1d2-73d6e3e9d7f8",
              "type": "SELECT",
              "name": "contactAutoCreationPolicy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'SENT'",
              "options": [
                {
                  "id": "3bb18757-641e-4abc-b32e-fd0499894373",
                  "color": "green",
                  "label": "Sent and Received",
                  "value": "SENT_AND_RECEIVED",
                  "position": 0
                },
                {
                  "id": "2edbff7a-262d-415e-8f06-52c19b1fec1a",
                  "color": "blue",
                  "label": "Sent",
                  "value": "SENT",
                  "position": 1
                },
                {
                  "id": "f910cb43-d8ad-4948-ab22-7d8cf169e4ed",
                  "color": "red",
                  "label": "None",
                  "value": "NONE",
                  "position": 2
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Contact auto creation policy",
              "description": "Automatically create People records when receiving or sending emails",
              "icon": "IconUserCircle"
            },
            {
              "__typename": "Field",
              "id": "2bb9fa34-fcd4-43b3-8aea-c8e0d57eb19e",
              "type": "BOOLEAN",
              "name": "excludeNonProfessionalEmails",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": true,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Exclude non professional emails",
              "description": "Exclude non professional emails",
              "icon": "IconBriefcase"
            },
            {
              "__typename": "Field",
              "id": "82379033-8ef7-401d-8739-a91adcc10482",
              "type": "BOOLEAN",
              "name": "excludeGroupEmails",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": true,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Exclude group emails",
              "description": "Exclude group emails",
              "icon": "IconUsersGroup"
            },
            {
              "__typename": "Field",
              "id": "6ced7b3c-6c43-4994-b823-bea51ecdf24b",
              "type": "BOOLEAN",
              "name": "isSyncEnabled",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": true,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Is Sync Enabled",
              "description": "Is Sync Enabled",
              "icon": "IconRefresh"
            },
            {
              "__typename": "Field",
              "id": "32a61eda-62b1-4b6a-adfe-493f0901925a",
              "type": "TEXT",
              "name": "syncCursor",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last sync cursor",
              "description": "Last sync cursor",
              "icon": "IconHistory"
            },
            {
              "__typename": "Field",
              "id": "6ef2a71d-d803-4e8d-9b01-b8e126e1ab55",
              "type": "DATE_TIME",
              "name": "syncedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last sync date",
              "description": "Last sync date",
              "icon": "IconHistory"
            },
            {
              "__typename": "Field",
              "id": "bdd3fb89-2615-4227-89e4-2baa6fb25dd3",
              "type": "SELECT",
              "name": "syncStatus",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": [
                {
                  "id": "db2bf986-82a8-4498-be41-f55a35791c33",
                  "color": "yellow",
                  "label": "Ongoing",
                  "value": "ONGOING",
                  "position": 1
                },
                {
                  "id": "43c1be65-3ce9-4d10-856f-56c8e7a0bdfa",
                  "color": "blue",
                  "label": "Not Synced",
                  "value": "NOT_SYNCED",
                  "position": 2
                },
                {
                  "id": "7c52eec3-91c6-4bc7-a98d-4f9abdefac08",
                  "color": "green",
                  "label": "Active",
                  "value": "ACTIVE",
                  "position": 3
                },
                {
                  "id": "24ae959c-c413-41ef-813d-a70b80ba25a3",
                  "color": "red",
                  "label": "Failed Insufficient Permissions",
                  "value": "FAILED_INSUFFICIENT_PERMISSIONS",
                  "position": 4
                },
                {
                  "id": "ef6c4e9f-4ccc-4a1b-896b-68848d14064a",
                  "color": "red",
                  "label": "Failed Unknown",
                  "value": "FAILED_UNKNOWN",
                  "position": 5
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Sync status",
              "description": "Sync status",
              "icon": "IconStatusChange"
            },
            {
              "__typename": "Field",
              "id": "68e4e546-d1ba-4886-a259-c5d7217590ee",
              "type": "SELECT",
              "name": "syncStage",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'FULL_MESSAGE_LIST_FETCH_PENDING'",
              "options": [
                {
                  "id": "fb7b49c9-883b-4df0-bb9c-f61065e8bdbc",
                  "color": "blue",
                  "label": "Full messages list fetch pending",
                  "value": "FULL_MESSAGE_LIST_FETCH_PENDING",
                  "position": 0
                },
                {
                  "id": "02261e4d-bb16-4c6f-b6b8-fa2f12559c1b",
                  "color": "blue",
                  "label": "Partial messages list fetch pending",
                  "value": "PARTIAL_MESSAGE_LIST_FETCH_PENDING",
                  "position": 1
                },
                {
                  "id": "4318662f-33b3-4139-97ad-efce1385d87a",
                  "color": "orange",
                  "label": "Messages list fetch ongoing",
                  "value": "MESSAGE_LIST_FETCH_ONGOING",
                  "position": 2
                },
                {
                  "id": "a7bf1565-2bec-4a73-af49-04cfa588cc1a",
                  "color": "blue",
                  "label": "Messages import pending",
                  "value": "MESSAGES_IMPORT_PENDING",
                  "position": 3
                },
                {
                  "id": "ccb7cb05-9aa9-4828-a39e-7bc4cc88c766",
                  "color": "orange",
                  "label": "Messages import ongoing",
                  "value": "MESSAGES_IMPORT_ONGOING",
                  "position": 4
                },
                {
                  "id": "b2b9580b-c07b-400f-b603-4423145689a4",
                  "color": "red",
                  "label": "Failed",
                  "value": "FAILED",
                  "position": 5
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Sync stage",
              "description": "Sync stage",
              "icon": "IconStatusChange"
            },
            {
              "__typename": "Field",
              "id": "7f79327f-6e1c-427a-8ddf-76ba23bcfac7",
              "type": "DATE_TIME",
              "name": "syncStageStartedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Sync stage started at",
              "description": "Sync stage started at",
              "icon": "IconHistory"
            },
            {
              "__typename": "Field",
              "id": "846c0542-eb69-497b-9064-f935bfabc660",
              "type": "NUMBER",
              "name": "throttleFailureCount",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": 0,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Throttle Failure Count",
              "description": "Throttle Failure Count",
              "icon": "IconX"
            },
            {
              "__typename": "Field",
              "id": "58f33d92-38df-457e-9e2e-7bab2508fcb4",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "380e19a7-453a-4a36-a327-9325cddf9212",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "53ae55a3-dfd2-4034-a94e-faff2773a1a4",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "1ef4077c-768b-4514-9ec5-7dcf0e150817",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "11cfcc54-b483-45dc-b0e1-01d5956ca8d5",
              "type": "RELATION",
              "name": "connectedAccount",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "connectedAccountId"
              },
              "isLabelSyncedWithName": false,
              "label": "Connected Account",
              "description": "Connected Account",
              "icon": "IconUserCircle",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "4ccdf309-8939-4852-ac6d-4a2691cde89e",
                  "nameSingular": "messageChannel",
                  "namePlural": "messageChannels"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "b275aa83-4488-464b-a6e4-b9b641630259",
                  "nameSingular": "connectedAccount",
                  "namePlural": "connectedAccounts"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "11cfcc54-b483-45dc-b0e1-01d5956ca8d5",
                  "name": "connectedAccount"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "521814df-72e3-4fcd-8402-306f901372d1",
                  "name": "messageChannels"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "6001716d-a0b5-41a3-9db5-5366473cba20",
              "type": "RELATION",
              "name": "messageChannelMessageAssociations",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Message Channel Association",
              "description": "Messages from the channel.",
              "icon": "IconMessage",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "4ccdf309-8939-4852-ac6d-4a2691cde89e",
                  "nameSingular": "messageChannel",
                  "namePlural": "messageChannels"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "3665f54d-63e3-401a-9dbf-6365eacf5313",
                  "nameSingular": "messageChannelMessageAssociation",
                  "namePlural": "messageChannelMessageAssociations"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "6001716d-a0b5-41a3-9db5-5366473cba20",
                  "name": "messageChannelMessageAssociations"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "ad04df84-f668-404f-9458-c67165f01ef6",
                  "name": "messageChannel"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "07d1c561-6c13-45f7-9385-207590988acf",
              "type": "RELATION",
              "name": "messageFolders",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Message Folders",
              "description": "Message Folders",
              "icon": "IconFolder",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "4ccdf309-8939-4852-ac6d-4a2691cde89e",
                  "nameSingular": "messageChannel",
                  "namePlural": "messageChannels"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "056a8284-3dd0-49b9-b1a9-fe0a5615dfff",
                  "nameSingular": "messageFolder",
                  "namePlural": "messageFolders"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "07d1c561-6c13-45f7-9385-207590988acf",
                  "name": "messageFolders"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "fc89ca96-4c23-4588-a5bf-9276b2cc6d1d",
                  "name": "messageChannel"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "4abbd2fa-de1a-4f59-b5dd-3c51023b9003",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "taskTarget",
          "namePlural": "taskTargets",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "82e3616d-654e-4371-bc30-6111a51e2c5c",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Task Target",
          "labelPlural": "Task Targets",
          "description": "A task target",
          "icon": "IconCheckbox",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "82e3616d-654e-4371-bc30-6111a51e2c5c",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "1df67c61-b8ae-4492-ad6c-64966efac722",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "2b621ba5-ecbc-442f-b665-9d3acefa1764",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "49b462f9-935f-46ac-954b-a828dab4c362",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "182a5732-b4cb-443b-84ff-ee8b201e875a",
              "type": "RELATION",
              "name": "task",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "SET_NULL",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "taskId"
              },
              "isLabelSyncedWithName": false,
              "label": "Task",
              "description": "TaskTarget task",
              "icon": "IconCheckbox",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "4abbd2fa-de1a-4f59-b5dd-3c51023b9003",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "8d1b6c82-bb07-4c00-9b21-19caa65ae99d",
                  "nameSingular": "task",
                  "namePlural": "tasks"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "182a5732-b4cb-443b-84ff-ee8b201e875a",
                  "name": "task"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "53517dcb-24f4-4752-ab06-5a158a754a99",
                  "name": "taskTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "2909e9f9-79f9-4412-b91f-d092aa0f129c",
              "type": "RELATION",
              "name": "person",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "personId"
              },
              "isLabelSyncedWithName": false,
              "label": "Person",
              "description": "TaskTarget person",
              "icon": "IconUser",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "4abbd2fa-de1a-4f59-b5dd-3c51023b9003",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "5926b097-a8a9-4baa-a001-fa7034aad925",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "2909e9f9-79f9-4412-b91f-d092aa0f129c",
                  "name": "person"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "d2455cb3-da00-4a58-8010-b2679aef228b",
                  "name": "taskTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "d40466a2-2707-4272-b5ba-d666381429f2",
              "type": "RELATION",
              "name": "company",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "companyId"
              },
              "isLabelSyncedWithName": false,
              "label": "Company",
              "description": "TaskTarget company",
              "icon": "IconBuildingSkyscraper",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "4abbd2fa-de1a-4f59-b5dd-3c51023b9003",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "8ceca214-6ae0-4eb4-806f-dae127ca6f9b",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "d40466a2-2707-4272-b5ba-d666381429f2",
                  "name": "company"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "23fecd6e-3671-4a61-8bc7-b9746fa620c4",
                  "name": "taskTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "c3a334f4-54cc-4d5d-9eab-57b38cf547b8",
              "type": "RELATION",
              "name": "opportunity",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "opportunityId"
              },
              "isLabelSyncedWithName": false,
              "label": "Opportunity",
              "description": "TaskTarget opportunity",
              "icon": "IconTargetArrow",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "4abbd2fa-de1a-4f59-b5dd-3c51023b9003",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "716f221d-8141-4c27-a049-d25b4fb5cfcc",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "c3a334f4-54cc-4d5d-9eab-57b38cf547b8",
                  "name": "opportunity"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "0ec0cbda-2f7a-4ae1-a0b3-f1679a52169e",
                  "name": "taskTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "10f8e22f-7444-4a33-bc33-7f6c98ec68a1",
              "type": "RELATION",
              "name": "pet",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:03.605Z",
              "updatedAt": "2025-06-06T14:43:03.605Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "petId"
              },
              "isLabelSyncedWithName": false,
              "label": "Pet",
              "description": "TaskTargets Pet",
              "icon": "IconBuildingSkyscraper",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "4abbd2fa-de1a-4f59-b5dd-3c51023b9003",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "d2a824df-b1a7-421b-a1c4-e2488bf580b9",
                  "nameSingular": "pet",
                  "namePlural": "pets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "10f8e22f-7444-4a33-bc33-7f6c98ec68a1",
                  "name": "pet"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "96661489-6495-45e7-9706-77c6884a0000",
                  "name": "taskTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "8df96058-16de-4dfe-b868-8a8ecd353f34",
              "type": "RELATION",
              "name": "surveyResult",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:07.825Z",
              "updatedAt": "2025-06-06T14:43:07.825Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "surveyResultId"
              },
              "isLabelSyncedWithName": false,
              "label": "Survey result",
              "description": "TaskTargets Survey result",
              "icon": "IconBuildingSkyscraper",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "4abbd2fa-de1a-4f59-b5dd-3c51023b9003",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "154570b7-3d4f-401d-ab7f-748903f1be28",
                  "nameSingular": "surveyResult",
                  "namePlural": "surveyResults"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "8df96058-16de-4dfe-b868-8a8ecd353f34",
                  "name": "surveyResult"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "e5c78a3a-7fa4-4cbe-9526-bf8944153fcf",
                  "name": "taskTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "10d91525-9000-4a9b-9009-f5a0ec274b17",
              "type": "RELATION",
              "name": "rocket",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:02.142Z",
              "updatedAt": "2025-06-06T14:43:02.142Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "rocketId"
              },
              "isLabelSyncedWithName": false,
              "label": "Rocket",
              "description": "TaskTargets Rocket",
              "icon": "IconBuildingSkyscraper",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "4abbd2fa-de1a-4f59-b5dd-3c51023b9003",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "0ae004b8-8489-4f02-b54a-b3b123e3db9f",
                  "nameSingular": "rocket",
                  "namePlural": "rockets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "10d91525-9000-4a9b-9009-f5a0ec274b17",
                  "name": "rocket"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "f2218164-f0ef-4ce6-a635-1c58828e037d",
                  "name": "taskTargets"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "40eb99df-f9fa-4abc-968b-039328ab0812",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "webhook",
          "namePlural": "webhooks",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "4afc1c92-6485-4a9f-a6df-e337a1be2a8a",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Webhook",
          "labelPlural": "Webhooks",
          "description": "A webhook",
          "icon": "IconRobot",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "4afc1c92-6485-4a9f-a6df-e337a1be2a8a",
              "type": "TEXT",
              "name": "targetUrl",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Target Url",
              "description": "Webhook target url",
              "icon": "IconLink"
            },
            {
              "__typename": "Field",
              "id": "4c339f87-a59c-495a-8ffe-75e06d824f6a",
              "type": "ARRAY",
              "name": "operations",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": [
                "*.*"
              ],
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Operations",
              "description": "Webhook operations",
              "icon": "IconCheckbox"
            },
            {
              "__typename": "Field",
              "id": "4b6647ee-d251-45eb-ab8f-cfe68b713233",
              "type": "TEXT",
              "name": "description",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Description",
              "description": "",
              "icon": "IconInfo"
            },
            {
              "__typename": "Field",
              "id": "0d00eaef-cfdc-4089-a874-67ad13dff9a3",
              "type": "TEXT",
              "name": "secret",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Secret",
              "description": "Optional secret used to compute the HMAC signature for webhook payloads. This secret is shared between Twenty and the webhook consumer to authenticate webhook requests.",
              "icon": "IconLock"
            },
            {
              "__typename": "Field",
              "id": "b2c3a720-aa51-4bc4-8064-f49c8a1b0c0d",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "3d94b73e-1d08-46fa-84be-ce3fa03e6a2d",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "0d38eddd-69d0-4f3e-ac42-c2cf968f3837",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "7dfadc1a-941d-49d7-8b79-40888daaf3b1",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "402717a2-7bb3-4404-b130-7baf8883ea6d",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "viewField",
          "namePlural": "viewFields",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "dd2b84c2-671d-493c-8742-84e4418b4049",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "View Field",
          "labelPlural": "View Fields",
          "description": "(System) View Fields",
          "icon": "IconTag",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "4e139f0f-22f2-4bad-9bc3-b7707be89115",
              "type": "UUID",
              "name": "fieldMetadataId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Field Metadata Id",
              "description": "View Field target field",
              "icon": "IconTag"
            },
            {
              "__typename": "Field",
              "id": "f29c482d-bcd7-48f4-ab5b-0fa7c69b6eee",
              "type": "BOOLEAN",
              "name": "isVisible",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": true,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Visible",
              "description": "View Field visibility",
              "icon": "IconEye"
            },
            {
              "__typename": "Field",
              "id": "82da6a58-b95b-45d5-aae4-0e02a53f649a",
              "type": "NUMBER",
              "name": "size",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": 0,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Size",
              "description": "View Field size",
              "icon": "IconEye"
            },
            {
              "__typename": "Field",
              "id": "d5ac67fa-3484-4e6d-8cda-b53c413ea693",
              "type": "NUMBER",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": 0,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Position",
              "description": "View Field position",
              "icon": "IconList"
            },
            {
              "__typename": "Field",
              "id": "73c26269-88fe-4d44-9ac5-40ea3cdf0a0e",
              "type": "SELECT",
              "name": "aggregateOperation",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": [
                {
                  "id": "3d2f51f6-7b1a-4f61-b9be-0cf1374f4691",
                  "color": "red",
                  "label": "Average",
                  "value": "AVG",
                  "position": 0
                },
                {
                  "id": "45608a17-6930-4b16-98a2-98ba217abfe6",
                  "color": "purple",
                  "label": "Count",
                  "value": "COUNT",
                  "position": 1
                },
                {
                  "id": "39dad52c-d4f1-43af-9a5e-a12d4c59a20d",
                  "color": "sky",
                  "label": "Maximum",
                  "value": "MAX",
                  "position": 2
                },
                {
                  "id": "b1c5ec9a-ae16-446e-ab6f-e65c52814d4b",
                  "color": "turquoise",
                  "label": "Minimum",
                  "value": "MIN",
                  "position": 3
                },
                {
                  "id": "85ea572d-2909-4121-b0bb-1d409182a0b4",
                  "color": "yellow",
                  "label": "Sum",
                  "value": "SUM",
                  "position": 4
                },
                {
                  "id": "f4b84307-abab-4dd2-93f3-dd914fe9eba5",
                  "color": "red",
                  "label": "Count empty",
                  "value": "COUNT_EMPTY",
                  "position": 5
                },
                {
                  "id": "bc336e9a-b785-49a9-b5ba-f3a7fd64a19e",
                  "color": "purple",
                  "label": "Count not empty",
                  "value": "COUNT_NOT_EMPTY",
                  "position": 6
                },
                {
                  "id": "153da965-8156-481f-ba08-8d0c30810579",
                  "color": "sky",
                  "label": "Count unique values",
                  "value": "COUNT_UNIQUE_VALUES",
                  "position": 7
                },
                {
                  "id": "a4a424b7-f4ad-4ecd-a72d-affba85f776f",
                  "color": "turquoise",
                  "label": "Percent empty",
                  "value": "PERCENTAGE_EMPTY",
                  "position": 8
                },
                {
                  "id": "bb76700a-eb96-4178-a2fe-c76b5f0be870",
                  "color": "yellow",
                  "label": "Percent not empty",
                  "value": "PERCENTAGE_NOT_EMPTY",
                  "position": 9
                },
                {
                  "id": "f9278cb3-dcc8-49e6-8922-118d532f4aaf",
                  "color": "red",
                  "label": "Count true",
                  "value": "COUNT_TRUE",
                  "position": 10
                },
                {
                  "id": "81985189-8bf0-42f2-b76c-2b9eb33df5af",
                  "color": "purple",
                  "label": "Count false",
                  "value": "COUNT_FALSE",
                  "position": 11
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Aggregate operation",
              "description": "Optional aggregate operation",
              "icon": "IconCalculator"
            },
            {
              "__typename": "Field",
              "id": "dd2b84c2-671d-493c-8742-84e4418b4049",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "0cbc6235-73c6-4ec7-95f2-0031af908017",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "98cbcbf4-8265-4cec-a0b5-d2fa9adc697e",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "db7be706-7203-4d10-99cd-cbcef2cff681",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "8f35d873-be30-4224-9e50-10b9894d5327",
              "type": "RELATION",
              "name": "view",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "viewId"
              },
              "isLabelSyncedWithName": false,
              "label": "View",
              "description": "View Field related view",
              "icon": "IconLayoutCollage",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "402717a2-7bb3-4404-b130-7baf8883ea6d",
                  "nameSingular": "viewField",
                  "namePlural": "viewFields"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "93c079c7-1af4-4f0b-970a-cac536005231",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "8f35d873-be30-4224-9e50-10b9894d5327",
                  "name": "view"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "89662f5c-7a70-483c-a73f-9648bca7fb93",
                  "name": "viewFields"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "3fe7df0e-03c0-40e9-8242-bb475c9be8fb",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "workflowRun",
          "namePlural": "workflowRuns",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": false,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "efce5e49-05e9-4e3e-845c-7497e15e86cf",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Workflow Run",
          "labelPlural": "Workflow Runs",
          "description": "A workflow run",
          "icon": "IconHistoryToggle",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "efce5e49-05e9-4e3e-845c-7497e15e86cf",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Name",
              "description": "Name of the workflow run",
              "icon": "IconSettingsAutomation"
            },
            {
              "__typename": "Field",
              "id": "e03beaca-7234-444f-9004-15cf168ab048",
              "type": "DATE_TIME",
              "name": "startedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Workflow run started at",
              "description": "Workflow run started at",
              "icon": "IconHistory"
            },
            {
              "__typename": "Field",
              "id": "d3ccffca-6462-4b56-8a35-b410b4facc76",
              "type": "DATE_TIME",
              "name": "endedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Workflow run ended at",
              "description": "Workflow run ended at",
              "icon": "IconHistory"
            },
            {
              "__typename": "Field",
              "id": "bbc735a5-7f5b-4f18-ae39-2870722c1c51",
              "type": "SELECT",
              "name": "status",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'NOT_STARTED'",
              "options": [
                {
                  "id": "a47682ef-9175-4142-aa7e-3face1a434ad",
                  "color": "gray",
                  "label": "Not started",
                  "value": "NOT_STARTED",
                  "position": 0
                },
                {
                  "id": "76cf7f85-0835-46c2-a03a-78284ca99dbd",
                  "color": "yellow",
                  "label": "Running",
                  "value": "RUNNING",
                  "position": 1
                },
                {
                  "id": "01354a8d-0d4d-4d16-b014-40824e2c18c0",
                  "color": "green",
                  "label": "Completed",
                  "value": "COMPLETED",
                  "position": 2
                },
                {
                  "id": "03ef63eb-2d37-4dff-bfc1-43a3ee6d4161",
                  "color": "red",
                  "label": "Failed",
                  "value": "FAILED",
                  "position": 3
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Workflow run status",
              "description": "Workflow run status",
              "icon": "IconStatusChange"
            },
            {
              "__typename": "Field",
              "id": "2ab3fbe9-4367-46ac-a4a8-754ddbbee530",
              "type": "ACTOR",
              "name": "createdBy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": {
                "name": "'System'",
                "source": "'MANUAL'",
                "context": {}
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Executed by",
              "description": "The executor of the workflow",
              "icon": "IconCreativeCommonsSa"
            },
            {
              "__typename": "Field",
              "id": "53381f50-371f-4dc4-87c2-476c504f14c7",
              "type": "RAW_JSON",
              "name": "output",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Output",
              "description": "Json object to provide output of the workflow run",
              "icon": "IconText"
            },
            {
              "__typename": "Field",
              "id": "59b3d1eb-7409-4f0a-b4f0-cd8dc34c861f",
              "type": "RAW_JSON",
              "name": "context",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Context",
              "description": "Context",
              "icon": "IconHierarchy2"
            },
            {
              "__typename": "Field",
              "id": "a580f59c-c64f-4aff-acdb-f1053b20c439",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": 0,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Position",
              "description": "Workflow run position",
              "icon": "IconHierarchy2"
            },
            {
              "__typename": "Field",
              "id": "1b3d2ba4-7b61-4be7-9e4c-2cc30097d1c9",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "df4ba2ca-09b2-4c72-8fdc-8378ac0fa9e0",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "93f2977f-f538-40c6-8ec8-9500c7d01d0f",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "ca0a0f16-9112-4670-9d1a-40d6b91428df",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "27ed9d56-ff2a-4b8f-9c42-5f411e2c00c5",
              "type": "RELATION",
              "name": "workflowVersion",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "SET_NULL",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "workflowVersionId"
              },
              "isLabelSyncedWithName": false,
              "label": "Workflow version",
              "description": "Workflow version linked to the run.",
              "icon": "IconVersions",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "3fe7df0e-03c0-40e9-8242-bb475c9be8fb",
                  "nameSingular": "workflowRun",
                  "namePlural": "workflowRuns"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "fed7d356-a8b2-4861-8624-2f48b6358d37",
                  "nameSingular": "workflowVersion",
                  "namePlural": "workflowVersions"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "27ed9d56-ff2a-4b8f-9c42-5f411e2c00c5",
                  "name": "workflowVersion"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "2deb39f3-46fd-4fb4-a00b-caf42f663fdb",
                  "name": "runs"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "a3d6322d-24bc-41cb-b3fb-e403e0e9af8f",
              "type": "RELATION",
              "name": "workflow",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "workflowId"
              },
              "isLabelSyncedWithName": false,
              "label": "Workflow",
              "description": "Workflow linked to the run.",
              "icon": "IconSettingsAutomation",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "3fe7df0e-03c0-40e9-8242-bb475c9be8fb",
                  "nameSingular": "workflowRun",
                  "namePlural": "workflowRuns"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "9c5ae6bd-a403-4769-a50b-9953e6f5113b",
                  "nameSingular": "workflow",
                  "namePlural": "workflows"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "a3d6322d-24bc-41cb-b3fb-e403e0e9af8f",
                  "name": "workflow"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "d21eecc7-bd47-4b5b-8aa2-a9b9ae486723",
                  "name": "runs"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "0d7b9ed2-70dd-4d2e-89d3-119a8e1bc749",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Favorites",
              "description": "Favorites linked to the workflow run",
              "icon": "IconHeart",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "3fe7df0e-03c0-40e9-8242-bb475c9be8fb",
                  "nameSingular": "workflowRun",
                  "namePlural": "workflowRuns"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "0d7b9ed2-70dd-4d2e-89d3-119a8e1bc749",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "a97bfc69-7a72-413c-b904-cf0972637deb",
                  "name": "workflowRun"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "c578c7e9-0903-4b1a-a759-63b7c362d8ee",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Timeline Activities",
              "description": "Timeline activities linked to the run",
              "icon": "",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "3fe7df0e-03c0-40e9-8242-bb475c9be8fb",
                  "nameSingular": "workflowRun",
                  "namePlural": "workflowRuns"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "c578c7e9-0903-4b1a-a759-63b7c362d8ee",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "163525a2-5edd-4934-9d9c-14e665c1412b",
                  "name": "workflowRun"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "3665f54d-63e3-401a-9dbf-6365eacf5313",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "messageChannelMessageAssociation",
          "namePlural": "messageChannelMessageAssociations",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "a8032df8-7a78-4170-9531-242fedea0f92",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Message Channel Message Association",
          "labelPlural": "Message Channel Message Associations",
          "description": "Message Synced with a Message Channel",
          "icon": "IconMessage",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "7be6c83b-a0f3-442d-b9ad-2883391b9fb7",
              "type": "TEXT",
              "name": "messageExternalId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Message External Id",
              "description": "Message id from the messaging provider",
              "icon": "IconHash"
            },
            {
              "__typename": "Field",
              "id": "268c9f41-5f4a-432e-b2c9-52d61820bad5",
              "type": "TEXT",
              "name": "messageThreadExternalId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Thread External Id",
              "description": "Thread id from the messaging provider",
              "icon": "IconHash"
            },
            {
              "__typename": "Field",
              "id": "cca22110-cae5-4ded-a458-a7df96cacbe4",
              "type": "SELECT",
              "name": "direction",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'INCOMING'",
              "options": [
                {
                  "id": "060f6c8e-64e2-4ce5-9701-ffbb1e8bee2f",
                  "color": "green",
                  "label": "Incoming",
                  "value": "INCOMING",
                  "position": 0
                },
                {
                  "id": "ec20112c-5993-431e-9f83-d4c92dfb0c62",
                  "color": "blue",
                  "label": "Outgoing",
                  "value": "OUTGOING",
                  "position": 1
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Direction",
              "description": "Message Direction",
              "icon": "IconDirection"
            },
            {
              "__typename": "Field",
              "id": "a8032df8-7a78-4170-9531-242fedea0f92",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "d4b00c90-7d30-4823-9c39-82b83219e53c",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "c83f261c-52ec-443f-9656-97972d9a6729",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "ccf02547-3648-43cb-8dc6-115f7747281d",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "ad04df84-f668-404f-9458-c67165f01ef6",
              "type": "RELATION",
              "name": "messageChannel",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "messageChannelId"
              },
              "isLabelSyncedWithName": false,
              "label": "Message Channel Id",
              "description": "Message Channel Id",
              "icon": "IconHash",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "3665f54d-63e3-401a-9dbf-6365eacf5313",
                  "nameSingular": "messageChannelMessageAssociation",
                  "namePlural": "messageChannelMessageAssociations"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4ccdf309-8939-4852-ac6d-4a2691cde89e",
                  "nameSingular": "messageChannel",
                  "namePlural": "messageChannels"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "ad04df84-f668-404f-9458-c67165f01ef6",
                  "name": "messageChannel"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "6001716d-a0b5-41a3-9db5-5366473cba20",
                  "name": "messageChannelMessageAssociations"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "1b83ce4e-1b2d-4a15-9353-17fd7cea9020",
              "type": "RELATION",
              "name": "message",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "messageId"
              },
              "isLabelSyncedWithName": false,
              "label": "Message Id",
              "description": "Message Id",
              "icon": "IconHash",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "3665f54d-63e3-401a-9dbf-6365eacf5313",
                  "nameSingular": "messageChannelMessageAssociation",
                  "namePlural": "messageChannelMessageAssociations"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "9a45b86e-5b27-4202-9591-ad5f659cb0d9",
                  "nameSingular": "message",
                  "namePlural": "messages"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "1b83ce4e-1b2d-4a15-9353-17fd7cea9020",
                  "name": "message"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "fcdc6705-b24d-4d74-bcb9-9d76860f10b0",
                  "name": "messageChannelMessageAssociations"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "3001f4f9-fd3e-4403-8f1f-bc8a135e2619",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "attachment",
          "namePlural": "attachments",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "d43601bc-04c6-498c-9bca-9ab42eaaa4ad",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Attachment",
          "labelPlural": "Attachments",
          "description": "An attachment",
          "icon": "IconFileImport",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "d43601bc-04c6-498c-9bca-9ab42eaaa4ad",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Name",
              "description": "Attachment name",
              "icon": "IconFileUpload"
            },
            {
              "__typename": "Field",
              "id": "c8f50f2c-2d59-4f8b-9779-bdb258cc93b9",
              "type": "TEXT",
              "name": "fullPath",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Full path",
              "description": "Attachment full path",
              "icon": "IconLink"
            },
            {
              "__typename": "Field",
              "id": "a2d3cd6e-396a-4af2-97ac-31717477870c",
              "type": "TEXT",
              "name": "type",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Type",
              "description": "Attachment type",
              "icon": "IconList"
            },
            {
              "__typename": "Field",
              "id": "04e32b5b-2619-4a95-a18b-a26d2ae496d8",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "21c15fa7-a656-48f7-a0d7-81e01bf2c5f5",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "b297fded-da0c-4425-b28d-c97a6bd30a68",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "69388cf4-e8d3-457d-b29a-093a2f0d7244",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "699ff27f-18eb-4c09-b9dc-543aa9fd2c46",
              "type": "RELATION",
              "name": "author",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "SET_NULL",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "authorId"
              },
              "isLabelSyncedWithName": false,
              "label": "Author",
              "description": "Attachment author",
              "icon": "IconCircleUser",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "3001f4f9-fd3e-4403-8f1f-bc8a135e2619",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "5821980a-4c2e-455c-8bb6-1a1eb0bf2b36",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "699ff27f-18eb-4c09-b9dc-543aa9fd2c46",
                  "name": "author"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "cb37ce6c-18c0-445e-aa91-2ab1120f15d3",
                  "name": "authoredAttachments"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "cc01039c-2c64-4964-b4c9-7fb762f42667",
              "type": "RELATION",
              "name": "task",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "SET_NULL",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "taskId"
              },
              "isLabelSyncedWithName": false,
              "label": "Task",
              "description": "Attachment task",
              "icon": "IconNotes",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "3001f4f9-fd3e-4403-8f1f-bc8a135e2619",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "8d1b6c82-bb07-4c00-9b21-19caa65ae99d",
                  "nameSingular": "task",
                  "namePlural": "tasks"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "cc01039c-2c64-4964-b4c9-7fb762f42667",
                  "name": "task"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "f5f77de6-beb2-4a59-a143-ed85a06afe34",
                  "name": "attachments"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "e50d63fe-1125-4309-9f40-2b6b79663cb6",
              "type": "RELATION",
              "name": "note",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "SET_NULL",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "noteId"
              },
              "isLabelSyncedWithName": false,
              "label": "Note",
              "description": "Attachment note",
              "icon": "IconNotes",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "3001f4f9-fd3e-4403-8f1f-bc8a135e2619",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "65da8c99-e1a5-4130-86e8-ff4f79b1d6c8",
                  "nameSingular": "note",
                  "namePlural": "notes"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "e50d63fe-1125-4309-9f40-2b6b79663cb6",
                  "name": "note"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "99658dad-d108-4781-8b16-f2eaecf3c51f",
                  "name": "attachments"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "e117cd57-c941-4321-9315-2be5aadf94b1",
              "type": "RELATION",
              "name": "person",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "personId"
              },
              "isLabelSyncedWithName": false,
              "label": "Person",
              "description": "Attachment person",
              "icon": "IconUser",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "3001f4f9-fd3e-4403-8f1f-bc8a135e2619",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "5926b097-a8a9-4baa-a001-fa7034aad925",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "e117cd57-c941-4321-9315-2be5aadf94b1",
                  "name": "person"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "cc75a9c1-f240-4e49-b56d-e0a8b5f73363",
                  "name": "attachments"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "8a9e8fb8-68e1-4293-899e-9e28d769078e",
              "type": "RELATION",
              "name": "company",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "companyId"
              },
              "isLabelSyncedWithName": false,
              "label": "Company",
              "description": "Attachment company",
              "icon": "IconBuildingSkyscraper",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "3001f4f9-fd3e-4403-8f1f-bc8a135e2619",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "8ceca214-6ae0-4eb4-806f-dae127ca6f9b",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "8a9e8fb8-68e1-4293-899e-9e28d769078e",
                  "name": "company"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "140bb2ea-5d92-420d-91b4-3ccbb559fc76",
                  "name": "attachments"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "cc254073-7a20-4c84-bae8-78533e40e3e7",
              "type": "RELATION",
              "name": "opportunity",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "opportunityId"
              },
              "isLabelSyncedWithName": false,
              "label": "Opportunity",
              "description": "Attachment opportunity",
              "icon": "IconBuildingSkyscraper",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "3001f4f9-fd3e-4403-8f1f-bc8a135e2619",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "716f221d-8141-4c27-a049-d25b4fb5cfcc",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "cc254073-7a20-4c84-bae8-78533e40e3e7",
                  "name": "opportunity"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "b7db4046-bb9e-4420-9cf9-d126a33301b4",
                  "name": "attachments"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "61b31622-dbe1-4c1c-a58c-9ddaded32f80",
              "type": "RELATION",
              "name": "rocket",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:02.136Z",
              "updatedAt": "2025-06-06T14:43:02.136Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "rocketId"
              },
              "isLabelSyncedWithName": false,
              "label": "Rocket",
              "description": "Attachments Rocket",
              "icon": "IconBuildingSkyscraper",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "3001f4f9-fd3e-4403-8f1f-bc8a135e2619",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "0ae004b8-8489-4f02-b54a-b3b123e3db9f",
                  "nameSingular": "rocket",
                  "namePlural": "rockets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "61b31622-dbe1-4c1c-a58c-9ddaded32f80",
                  "name": "rocket"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "c082e219-54c5-4647-bd40-5f5ad275976c",
                  "name": "attachments"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "2eb052e2-b9e8-4e5d-8f36-2aa91ed5a068",
              "type": "RELATION",
              "name": "pet",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:03.593Z",
              "updatedAt": "2025-06-06T14:43:03.593Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "petId"
              },
              "isLabelSyncedWithName": false,
              "label": "Pet",
              "description": "Attachments Pet",
              "icon": "IconBuildingSkyscraper",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "3001f4f9-fd3e-4403-8f1f-bc8a135e2619",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "d2a824df-b1a7-421b-a1c4-e2488bf580b9",
                  "nameSingular": "pet",
                  "namePlural": "pets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "2eb052e2-b9e8-4e5d-8f36-2aa91ed5a068",
                  "name": "pet"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "df349cf8-9bd9-44f9-a188-c1834d8fd20c",
                  "name": "attachments"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "e12e0086-eaa7-4323-886c-54fa1ea1cc26",
              "type": "RELATION",
              "name": "surveyResult",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:07.817Z",
              "updatedAt": "2025-06-06T14:43:07.817Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "surveyResultId"
              },
              "isLabelSyncedWithName": false,
              "label": "Survey result",
              "description": "Attachments Survey result",
              "icon": "IconBuildingSkyscraper",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "3001f4f9-fd3e-4403-8f1f-bc8a135e2619",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "154570b7-3d4f-401d-ab7f-748903f1be28",
                  "nameSingular": "surveyResult",
                  "namePlural": "surveyResults"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "e12e0086-eaa7-4323-886c-54fa1ea1cc26",
                  "name": "surveyResult"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "dd5d53b7-8c92-4c05-a0a0-1ce01b80ac16",
                  "name": "attachments"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "22766eba-2fc8-496f-b1b0-732b4a4e55ab",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "favoriteFolder",
          "namePlural": "favoriteFolders",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "a39a2a44-773d-42e2-8882-14f344eb34b7",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Favorite Folder",
          "labelPlural": "Favorite Folders",
          "description": "A Folder of favorites",
          "icon": "IconFolder",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "0acdafbc-7902-4913-9257-7cb831e63765",
              "type": "NUMBER",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": 0,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Position",
              "description": "Favorite folder position",
              "icon": "IconList"
            },
            {
              "__typename": "Field",
              "id": "25e277a6-f591-4fac-9037-bd3dbae50c72",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Name",
              "description": "Name of the favorite folder",
              "icon": "IconText"
            },
            {
              "__typename": "Field",
              "id": "a39a2a44-773d-42e2-8882-14f344eb34b7",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "f1f89763-f7c1-493b-87fc-05c554f9bd3c",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "72438dbe-1a04-4191-a4f0-3c3fc3c4aedc",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "53773c6a-717f-4941-b72a-2b4a925081a4",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "c0bcfdc9-fd1a-4fa1-a6ed-b441f04544de",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Favorites",
              "description": "Favorites in this folder",
              "icon": "IconHeart",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "22766eba-2fc8-496f-b1b0-732b4a4e55ab",
                  "nameSingular": "favoriteFolder",
                  "namePlural": "favoriteFolders"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "c0bcfdc9-fd1a-4fa1-a6ed-b441f04544de",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "782291b4-6a60-4454-9232-ba141ea1623d",
                  "name": "favoriteFolder"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "22667e6b-0d3c-474f-bfc3-647f9bc0c0bc",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "viewGroup",
          "namePlural": "viewGroups",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "56bd7253-c298-4268-87f2-3db73f947110",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "View Group",
          "labelPlural": "View Groups",
          "description": "(System) View Groups",
          "icon": "IconTag",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "1fa0a014-eac6-4fec-be53-02a6df58b6e2",
              "type": "UUID",
              "name": "fieldMetadataId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Field Metadata Id",
              "description": "View Group target field",
              "icon": "IconTag"
            },
            {
              "__typename": "Field",
              "id": "be8550c5-69de-4453-9685-7f0d7364228b",
              "type": "BOOLEAN",
              "name": "isVisible",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": true,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Visible",
              "description": "View Group visibility",
              "icon": "IconEye"
            },
            {
              "__typename": "Field",
              "id": "7ed9d143-0b48-4c17-82c0-a7298cba9ce7",
              "type": "TEXT",
              "name": "fieldValue",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Field Value",
              "description": "Group by this field value",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "e5e53888-efea-43df-9516-553b0bfe2eb6",
              "type": "NUMBER",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": 0,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Position",
              "description": "View Field position",
              "icon": "IconList"
            },
            {
              "__typename": "Field",
              "id": "56bd7253-c298-4268-87f2-3db73f947110",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "8ff9918c-d278-4481-a049-a05a8a83aae5",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "8932b451-be11-4928-9d4f-6400b4fea3d8",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "70673919-3bb9-4d04-a14b-2481424423da",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "4e75e96d-233a-4d51-a3ce-b580040e4a10",
              "type": "RELATION",
              "name": "view",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "viewId"
              },
              "isLabelSyncedWithName": false,
              "label": "View",
              "description": "View Group related view",
              "icon": "IconLayoutCollage",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "22667e6b-0d3c-474f-bfc3-647f9bc0c0bc",
                  "nameSingular": "viewGroup",
                  "namePlural": "viewGroups"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "93c079c7-1af4-4f0b-970a-cac536005231",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "4e75e96d-233a-4d51-a3ce-b580040e4a10",
                  "name": "view"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "ae4bb39b-f525-4c44-b9ba-41d7ac3b892d",
                  "name": "viewGroups"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "154570b7-3d4f-401d-ab7f-748903f1be28",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "surveyResult",
          "namePlural": "surveyResults",
          "isCustom": true,
          "isRemote": false,
          "isActive": true,
          "isSystem": false,
          "createdAt": "2025-06-06T14:43:07.771Z",
          "updatedAt": "2025-06-06T14:43:07.798Z",
          "labelIdentifierFieldMetadataId": "17c2aee3-9534-4acd-b33c-ce8b4ebef6da",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": true,
          "duplicateCriteria": null,
          "labelSingular": "Survey result",
          "labelPlural": "Survey results",
          "description": null,
          "icon": "IconRulerMeasure",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "IndexEdge",
                "node": {
                  "__typename": "Index",
                  "id": "b6a11ec5-92d2-4b20-8bcb-4ba9ecbba978",
                  "createdAt": "2025-06-06T14:43:07.876Z",
                  "updatedAt": "2025-06-06T14:43:07.876Z",
                  "name": "IDX_e2a25535adda4544be555d3b6d8",
                  "indexWhereClause": null,
                  "indexType": "GIN",
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "IndexFieldEdge",
                        "node": {
                          "__typename": "IndexField",
                          "id": "2faac5d9-9dd9-4295-a361-c4c0d94d9af5",
                          "createdAt": "2025-06-06T14:43:07.876Z",
                          "updatedAt": "2025-06-06T14:43:07.876Z",
                          "order": 0,
                          "fieldMetadataId": "985fefa0-9544-4ab2-a11d-1b9aa9adda48"
                        }
                      }
                    ]
                  }
                }
              }
            ]
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "9f305f07-d0d9-499e-88ca-4ec604ddd8e2",
              "type": "RELATION",
              "name": "noteTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:07.818Z",
              "updatedAt": "2025-06-06T14:43:07.818Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "NoteTargets",
              "description": "NoteTargets tied to the Survey result",
              "icon": "IconCheckbox",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "154570b7-3d4f-401d-ab7f-748903f1be28",
                  "nameSingular": "surveyResult",
                  "namePlural": "surveyResults"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "897567d1-bee8-420d-8734-0a18459ea1d1",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "9f305f07-d0d9-499e-88ca-4ec604ddd8e2",
                  "name": "noteTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "0eeb75a0-b87a-40ce-a905-7d776d8f69e6",
                  "name": "surveyResult"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "985fefa0-9544-4ab2-a11d-1b9aa9adda48",
              "type": "TS_VECTOR",
              "name": "searchVector",
              "isCustom": false,
              "isActive": false,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:07.852Z",
              "updatedAt": "2025-06-06T14:43:07.852Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Search vector",
              "description": "Field used for full-text search",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "417e8da2-ab2c-448d-b170-0262bc6c6c0a",
              "type": "NUMBER",
              "name": "score",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:08.889Z",
              "updatedAt": "2025-06-06T14:43:08.889Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "type": "number",
                "dataType": "float",
                "decimals": 3
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Score (Float 3 decimals)",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "2d052266-b926-4229-973c-803eb66c7411",
              "type": "NUMBER",
              "name": "percentageOfCompletion",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:08.892Z",
              "updatedAt": "2025-06-06T14:43:08.892Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "type": "percentage",
                "dataType": "float",
                "decimals": 6
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Percentage of completion (Float 3 decimals + percentage)",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "eee16cb5-476c-46b3-b1b1-30cc8ac3d009",
              "type": "NUMBER",
              "name": "participants",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:08.894Z",
              "updatedAt": "2025-06-06T14:43:08.894Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "type": "number",
                "dataType": "int"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Participants (Int)",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "ec24a19d-220c-4949-b29d-fb9418bea3e5",
              "type": "NUMBER",
              "name": "averageEstimatedNumberOfAtomsInTheUniverse",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:08.898Z",
              "updatedAt": "2025-06-06T14:43:08.898Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "type": "number",
                "dataType": "bigint"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Average estimated number of atoms in the universe (BigInt)",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "a8c5e3bb-78ac-4771-8f43-61673f1f74f7",
              "type": "TEXT",
              "name": "comments",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:08.902Z",
              "updatedAt": "2025-06-06T14:43:08.902Z",
              "defaultValue": "''",
              "options": null,
              "settings": {
                "displayedMaxRows": 5
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Comments (Max 5 rows)",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "d25e6f67-4d39-47f0-96bb-67ba116d0587",
              "type": "TEXT",
              "name": "shortNotes",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:08.905Z",
              "updatedAt": "2025-06-06T14:43:08.905Z",
              "defaultValue": "''",
              "options": null,
              "settings": {
                "displayedMaxRows": 1
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Short notes (Max 1 row)",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "e5c78a3a-7fa4-4cbe-9526-bf8944153fcf",
              "type": "RELATION",
              "name": "taskTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:07.825Z",
              "updatedAt": "2025-06-06T14:43:07.825Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "TaskTargets",
              "description": "TaskTargets tied to the Survey result",
              "icon": "IconCheckbox",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "154570b7-3d4f-401d-ab7f-748903f1be28",
                  "nameSingular": "surveyResult",
                  "namePlural": "surveyResults"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4abbd2fa-de1a-4f59-b5dd-3c51023b9003",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "e5c78a3a-7fa4-4cbe-9526-bf8944153fcf",
                  "name": "taskTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "8df96058-16de-4dfe-b868-8a8ecd353f34",
                  "name": "surveyResult"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "dd5d53b7-8c92-4c05-a0a0-1ce01b80ac16",
              "type": "RELATION",
              "name": "attachments",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:07.817Z",
              "updatedAt": "2025-06-06T14:43:07.817Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Attachments",
              "description": "Attachments tied to the Survey result",
              "icon": "IconFileImport",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "154570b7-3d4f-401d-ab7f-748903f1be28",
                  "nameSingular": "surveyResult",
                  "namePlural": "surveyResults"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "3001f4f9-fd3e-4403-8f1f-bc8a135e2619",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "dd5d53b7-8c92-4c05-a0a0-1ce01b80ac16",
                  "name": "attachments"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "e12e0086-eaa7-4323-886c-54fa1ea1cc26",
                  "name": "surveyResult"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "b3e73ff1-e71e-473b-94c0-8438737f5992",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:07.817Z",
              "updatedAt": "2025-06-06T14:43:07.817Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Favorites",
              "description": "Favorites tied to the Survey result",
              "icon": "IconHeart",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "154570b7-3d4f-401d-ab7f-748903f1be28",
                  "nameSingular": "surveyResult",
                  "namePlural": "surveyResults"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "b3e73ff1-e71e-473b-94c0-8438737f5992",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "e8253655-c89d-4f24-aa54-68a36e627240",
                  "name": "surveyResult"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "10a286d9-eb71-4b6a-8964-8f17f3a34ff9",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:07.816Z",
              "updatedAt": "2025-06-06T14:43:07.816Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "TimelineActivities",
              "description": "TimelineActivities tied to the Survey result",
              "icon": "IconTimelineEvent",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "154570b7-3d4f-401d-ab7f-748903f1be28",
                  "nameSingular": "surveyResult",
                  "namePlural": "surveyResults"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "10a286d9-eb71-4b6a-8964-8f17f3a34ff9",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "646fc7e8-a640-4183-a204-eea9eccd0dfb",
                  "name": "surveyResult"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "6b0507cc-f36d-483b-96d5-db07ff2c78f3",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:07.771Z",
              "updatedAt": "2025-06-06T14:43:07.771Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "17c2aee3-9534-4acd-b33c-ce8b4ebef6da",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:07.771Z",
              "updatedAt": "2025-06-06T14:43:07.771Z",
              "defaultValue": "'Untitled'",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Name",
              "description": "Name",
              "icon": "IconAbc"
            },
            {
              "__typename": "Field",
              "id": "ab0d53cd-fddc-471e-bf5e-ed4ae778cafb",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:07.771Z",
              "updatedAt": "2025-06-06T14:43:07.771Z",
              "defaultValue": "now",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "f22281dd-b98c-4409-8512-c9fa14e49f89",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:07.771Z",
              "updatedAt": "2025-06-06T14:43:07.771Z",
              "defaultValue": "now",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "eec024d1-a780-45df-bbbb-c682c9b942ea",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:07.771Z",
              "updatedAt": "2025-06-06T14:43:07.771Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Deletion date",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "2061203d-8430-4e1e-a5dc-dabe1f852450",
              "type": "ACTOR",
              "name": "createdBy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:07.771Z",
              "updatedAt": "2025-06-06T14:43:07.771Z",
              "defaultValue": {
                "name": "''",
                "source": "'MANUAL'"
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Created by",
              "description": "The creator of the record",
              "icon": "IconCreativeCommonsSa"
            },
            {
              "__typename": "Field",
              "id": "79fb81a9-1103-47a9-bbc0-0bc76c0aa95b",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:07.771Z",
              "updatedAt": "2025-06-06T14:43:07.771Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Position",
              "description": "Position",
              "icon": "IconHierarchy2"
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "0ae004b8-8489-4f02-b54a-b3b123e3db9f",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "rocket",
          "namePlural": "rockets",
          "isCustom": true,
          "isRemote": false,
          "isActive": true,
          "isSystem": false,
          "createdAt": "2025-06-06T14:43:02.031Z",
          "updatedAt": "2025-06-06T14:43:02.047Z",
          "labelIdentifierFieldMetadataId": "b996e8f0-ae6d-40c2-8bf8-7c0e449a2644",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": true,
          "duplicateCriteria": null,
          "labelSingular": "Rocket",
          "labelPlural": "Rockets",
          "description": "A rocket",
          "icon": "IconRocket",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": [
              {
                "__typename": "IndexEdge",
                "node": {
                  "__typename": "Index",
                  "id": "6e143dec-3255-4b50-901d-9efeae538b3f",
                  "createdAt": "2025-06-06T14:43:02.205Z",
                  "updatedAt": "2025-06-06T14:43:02.205Z",
                  "name": "IDX_530792e4278e7696c4e3e3e55f8",
                  "indexWhereClause": null,
                  "indexType": "GIN",
                  "isUnique": false,
                  "indexFieldMetadatas": {
                    "__typename": "IndexIndexFieldMetadatasConnection",
                    "edges": [
                      {
                        "__typename": "IndexFieldEdge",
                        "node": {
                          "__typename": "IndexField",
                          "id": "31cb1cd9-f70d-47df-8b85-140e86d6de94",
                          "createdAt": "2025-06-06T14:43:02.205Z",
                          "updatedAt": "2025-06-06T14:43:02.205Z",
                          "order": 0,
                          "fieldMetadataId": "e11ba3f9-e16f-461e-b8d4-13c189953876"
                        }
                      }
                    ]
                  }
                }
              }
            ]
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "34afca3b-755a-458d-8cf7-f9933d52801f",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:02.031Z",
              "updatedAt": "2025-06-06T14:43:02.031Z",
              "defaultValue": "now",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "1ae1f8fe-408c-41db-a96f-df6e26499a5f",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:02.031Z",
              "updatedAt": "2025-06-06T14:43:02.031Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Deletion date",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "dd165b1a-a092-42bc-941a-94d31a4d61bb",
              "type": "ACTOR",
              "name": "createdBy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:02.031Z",
              "updatedAt": "2025-06-06T14:43:02.031Z",
              "defaultValue": {
                "name": "''",
                "source": "'MANUAL'"
              },
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Created by",
              "description": "The creator of the record",
              "icon": "IconCreativeCommonsSa"
            },
            {
              "__typename": "Field",
              "id": "0bb9cb2a-da00-405c-a22d-e2fc9ed45b0a",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:02.031Z",
              "updatedAt": "2025-06-06T14:43:02.031Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Position",
              "description": "Position",
              "icon": "IconHierarchy2"
            },
            {
              "__typename": "Field",
              "id": "3282b9fb-1316-4c13-9b9d-3423e6b287f0",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:02.064Z",
              "updatedAt": "2025-06-06T14:43:02.064Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "TimelineActivities",
              "description": "TimelineActivities tied to the Rocket",
              "icon": "IconTimelineEvent",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "0ae004b8-8489-4f02-b54a-b3b123e3db9f",
                  "nameSingular": "rocket",
                  "namePlural": "rockets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "66f6b666-60b4-4dca-82d9-f1dc4f226ed1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "3282b9fb-1316-4c13-9b9d-3423e6b287f0",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "de1447e4-f7fc-4140-9368-3b694d361a62",
                  "name": "rocket"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "c31a23ae-b9b6-45ff-a609-d6fc3f9b867e",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:02.031Z",
              "updatedAt": "2025-06-06T14:43:02.031Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "b996e8f0-ae6d-40c2-8bf8-7c0e449a2644",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:02.031Z",
              "updatedAt": "2025-06-06T14:43:02.031Z",
              "defaultValue": "'Untitled'",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Name",
              "description": "Name",
              "icon": "IconAbc"
            },
            {
              "__typename": "Field",
              "id": "5ca3c10c-7971-41b5-b89d-c7dd7a1c045f",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:02.031Z",
              "updatedAt": "2025-06-06T14:43:02.031Z",
              "defaultValue": "now",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "c082e219-54c5-4647-bd40-5f5ad275976c",
              "type": "RELATION",
              "name": "attachments",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:02.136Z",
              "updatedAt": "2025-06-06T14:43:02.136Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Attachments",
              "description": "Attachments tied to the Rocket",
              "icon": "IconFileImport",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "0ae004b8-8489-4f02-b54a-b3b123e3db9f",
                  "nameSingular": "rocket",
                  "namePlural": "rockets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "3001f4f9-fd3e-4403-8f1f-bc8a135e2619",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "c082e219-54c5-4647-bd40-5f5ad275976c",
                  "name": "attachments"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "61b31622-dbe1-4c1c-a58c-9ddaded32f80",
                  "name": "rocket"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "a5682ee4-e9a4-4481-8fc2-8108bd417356",
              "type": "RELATION",
              "name": "noteTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:02.145Z",
              "updatedAt": "2025-06-06T14:43:02.145Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "NoteTargets",
              "description": "NoteTargets tied to the Rocket",
              "icon": "IconCheckbox",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "0ae004b8-8489-4f02-b54a-b3b123e3db9f",
                  "nameSingular": "rocket",
                  "namePlural": "rockets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "897567d1-bee8-420d-8734-0a18459ea1d1",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "a5682ee4-e9a4-4481-8fc2-8108bd417356",
                  "name": "noteTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "75a6dc0b-a918-43ff-923a-87f298b19494",
                  "name": "rocket"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "f2218164-f0ef-4ce6-a635-1c58828e037d",
              "type": "RELATION",
              "name": "taskTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:02.142Z",
              "updatedAt": "2025-06-06T14:43:02.142Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "TaskTargets",
              "description": "TaskTargets tied to the Rocket",
              "icon": "IconCheckbox",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "0ae004b8-8489-4f02-b54a-b3b123e3db9f",
                  "nameSingular": "rocket",
                  "namePlural": "rockets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4abbd2fa-de1a-4f59-b5dd-3c51023b9003",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "f2218164-f0ef-4ce6-a635-1c58828e037d",
                  "name": "taskTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "10d91525-9000-4a9b-9009-f5a0ec274b17",
                  "name": "rocket"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "e11ba3f9-e16f-461e-b8d4-13c189953876",
              "type": "TS_VECTOR",
              "name": "searchVector",
              "isCustom": false,
              "isActive": false,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:02.167Z",
              "updatedAt": "2025-06-06T14:43:02.167Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Search vector",
              "description": "Field used for full-text search",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "bb3fed9e-50d6-4ad8-ada2-2fe4db034938",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:43:02.073Z",
              "updatedAt": "2025-06-06T14:43:02.073Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Favorites",
              "description": "Favorites tied to the Rocket",
              "icon": "IconHeart",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "0ae004b8-8489-4f02-b54a-b3b123e3db9f",
                  "nameSingular": "rocket",
                  "namePlural": "rockets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "6c0fb16d-d80f-4802-8528-32b3e7154fa6",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "bb3fed9e-50d6-4ad8-ada2-2fe4db034938",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "fa347313-1a30-4a2e-92aa-3f64a93a26f6",
                  "name": "rocket"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "0a927681-9662-45ea-9254-e21eea85305d",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "calendarChannel",
          "namePlural": "calendarChannels",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "8aed0aed-eb1a-4a8d-ab68-ed684e31515b",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Calendar Channel",
          "labelPlural": "Calendar Channels",
          "description": "Calendar Channels",
          "icon": "IconCalendar",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "8aed0aed-eb1a-4a8d-ab68-ed684e31515b",
              "type": "TEXT",
              "name": "handle",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Handle",
              "description": "Handle",
              "icon": "IconAt"
            },
            {
              "__typename": "Field",
              "id": "63271175-ca7a-46f7-93dc-c9c40d66aafd",
              "type": "SELECT",
              "name": "syncStatus",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": [
                {
                  "id": "edaaf717-1d8a-4e59-87de-7d90c761b5f1",
                  "color": "yellow",
                  "label": "Ongoing",
                  "value": "ONGOING",
                  "position": 1
                },
                {
                  "id": "286b5c67-bed1-44a3-bc96-007234c1bad1",
                  "color": "blue",
                  "label": "Not Synced",
                  "value": "NOT_SYNCED",
                  "position": 2
                },
                {
                  "id": "94f23cd2-2c76-419e-a7a3-11c997ae4602",
                  "color": "green",
                  "label": "Active",
                  "value": "ACTIVE",
                  "position": 3
                },
                {
                  "id": "9dc95c33-34f3-42af-96cc-ee87945ccd7e",
                  "color": "red",
                  "label": "Failed Insufficient Permissions",
                  "value": "FAILED_INSUFFICIENT_PERMISSIONS",
                  "position": 4
                },
                {
                  "id": "82b09714-c772-4b64-a985-dd70062d25da",
                  "color": "red",
                  "label": "Failed Unknown",
                  "value": "FAILED_UNKNOWN",
                  "position": 5
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Sync status",
              "description": "Sync status",
              "icon": "IconStatusChange"
            },
            {
              "__typename": "Field",
              "id": "765c5623-dd80-4008-8fbd-0d91b530fb9b",
              "type": "SELECT",
              "name": "syncStage",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'FULL_CALENDAR_EVENT_LIST_FETCH_PENDING'",
              "options": [
                {
                  "id": "685015b4-d4df-42d1-a220-e1bd3a7d3f77",
                  "color": "blue",
                  "label": "Full calendar event list fetch pending",
                  "value": "FULL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                  "position": 0
                },
                {
                  "id": "c6552718-fe4e-4775-9cfc-08b2dccb7b3d",
                  "color": "blue",
                  "label": "Partial calendar event list fetch pending",
                  "value": "PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                  "position": 1
                },
                {
                  "id": "d7dc1776-fdf7-4501-ba82-78a5a8175ee4",
                  "color": "orange",
                  "label": "Calendar event list fetch ongoing",
                  "value": "CALENDAR_EVENT_LIST_FETCH_ONGOING",
                  "position": 2
                },
                {
                  "id": "d1a362eb-faf1-4966-b334-23bc27ca438c",
                  "color": "blue",
                  "label": "Calendar events import pending",
                  "value": "CALENDAR_EVENTS_IMPORT_PENDING",
                  "position": 3
                },
                {
                  "id": "1d82dc94-80b8-4871-88ef-44a69786db1d",
                  "color": "orange",
                  "label": "Calendar events import ongoing",
                  "value": "CALENDAR_EVENTS_IMPORT_ONGOING",
                  "position": 4
                },
                {
                  "id": "d7eb72ae-a109-497b-bb65-0883a8b78199",
                  "color": "red",
                  "label": "Failed",
                  "value": "FAILED",
                  "position": 5
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Sync stage",
              "description": "Sync stage",
              "icon": "IconStatusChange"
            },
            {
              "__typename": "Field",
              "id": "e8dd7ae2-97b6-4bcf-8f3c-5a040701327d",
              "type": "SELECT",
              "name": "visibility",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'SHARE_EVERYTHING'",
              "options": [
                {
                  "id": "dba73d08-b535-4958-a162-482b5a23b2f1",
                  "color": "green",
                  "label": "Metadata",
                  "value": "METADATA",
                  "position": 0
                },
                {
                  "id": "5ae94be5-4928-4572-8c57-3142b585f552",
                  "color": "orange",
                  "label": "Share Everything",
                  "value": "SHARE_EVERYTHING",
                  "position": 1
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Visibility",
              "description": "Visibility",
              "icon": "IconEyeglass"
            },
            {
              "__typename": "Field",
              "id": "d717b2f5-c546-430c-9f66-1a52b0cb9be5",
              "type": "BOOLEAN",
              "name": "isContactAutoCreationEnabled",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": true,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Is Contact Auto Creation Enabled",
              "description": "Is Contact Auto Creation Enabled",
              "icon": "IconUserCircle"
            },
            {
              "__typename": "Field",
              "id": "28fb1845-b001-4080-bfe9-4b425f3d85ea",
              "type": "SELECT",
              "name": "contactAutoCreationPolicy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "'AS_PARTICIPANT_AND_ORGANIZER'",
              "options": [
                {
                  "id": "4a805c27-37e4-4b92-a753-b4d1487a5e9c",
                  "color": "green",
                  "label": "As Participant and Organizer",
                  "value": "AS_PARTICIPANT_AND_ORGANIZER",
                  "position": 0
                },
                {
                  "id": "99fe6584-32f7-45af-986e-6dea6b7d7ff7",
                  "color": "orange",
                  "label": "As Participant",
                  "value": "AS_PARTICIPANT",
                  "position": 1
                },
                {
                  "id": "21590e01-9fc4-4baf-b820-7a7e009e5926",
                  "color": "blue",
                  "label": "As Organizer",
                  "value": "AS_ORGANIZER",
                  "position": 2
                },
                {
                  "id": "089fead2-a189-45cf-a986-92c0c3ed1ac4",
                  "color": "red",
                  "label": "None",
                  "value": "NONE",
                  "position": 3
                }
              ],
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Contact auto creation policy",
              "description": "Automatically create records for people you participated with in an event.",
              "icon": "IconUserCircle"
            },
            {
              "__typename": "Field",
              "id": "3786c059-017b-46b5-9c16-43ba1b089318",
              "type": "BOOLEAN",
              "name": "isSyncEnabled",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": true,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Is Sync Enabled",
              "description": "Is Sync Enabled",
              "icon": "IconRefresh"
            },
            {
              "__typename": "Field",
              "id": "90daa98a-6393-450d-8895-2051602115dc",
              "type": "TEXT",
              "name": "syncCursor",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Sync Cursor",
              "description": "Sync Cursor. Used for syncing events from the calendar provider",
              "icon": "IconReload"
            },
            {
              "__typename": "Field",
              "id": "8c501cc4-ddfe-43ed-93f4-71a581daaec8",
              "type": "DATE_TIME",
              "name": "syncedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last sync date",
              "description": "Last sync date",
              "icon": "IconHistory"
            },
            {
              "__typename": "Field",
              "id": "d39ddd55-54ec-4973-9dab-a6bacd2fb81c",
              "type": "DATE_TIME",
              "name": "syncStageStartedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Sync stage started at",
              "description": "Sync stage started at",
              "icon": "IconHistory"
            },
            {
              "__typename": "Field",
              "id": "fd37fb45-c72c-4f6e-81f1-68ae4a2be91f",
              "type": "NUMBER",
              "name": "throttleFailureCount",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": 0,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Throttle Failure Count",
              "description": "Throttle Failure Count",
              "icon": "IconX"
            },
            {
              "__typename": "Field",
              "id": "b0344715-d046-4d00-b979-9a04d19dc207",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "4ed9d3ab-3e05-4c4b-87e1-22e6971e4e40",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "7100864a-fb43-49ed-bdef-c77fbffc7636",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "84e62d6c-cd2a-4aff-9644-76123a248e69",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "5594073e-be16-45fe-9718-4ee91c3b48fc",
              "type": "RELATION",
              "name": "connectedAccount",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "connectedAccountId"
              },
              "isLabelSyncedWithName": false,
              "label": "Connected Account",
              "description": "Connected Account",
              "icon": "IconUserCircle",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "0a927681-9662-45ea-9254-e21eea85305d",
                  "nameSingular": "calendarChannel",
                  "namePlural": "calendarChannels"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "b275aa83-4488-464b-a6e4-b9b641630259",
                  "nameSingular": "connectedAccount",
                  "namePlural": "connectedAccounts"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "5594073e-be16-45fe-9718-4ee91c3b48fc",
                  "name": "connectedAccount"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "c85fc80b-138c-48c4-b790-4b23d267f72d",
                  "name": "calendarChannels"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "03e2c0cd-8836-430d-98e4-857fcd9d3ef8",
              "type": "RELATION",
              "name": "calendarChannelEventAssociations",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "relationType": "ONE_TO_MANY"
              },
              "isLabelSyncedWithName": false,
              "label": "Calendar Channel Event Associations",
              "description": "Calendar Channel Event Associations",
              "icon": "IconCalendar",
              "relation": {
                "__typename": "Relation",
                "type": "ONE_TO_MANY",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "0a927681-9662-45ea-9254-e21eea85305d",
                  "nameSingular": "calendarChannel",
                  "namePlural": "calendarChannels"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "033ed93d-339f-4c5d-9fe8-846abc0972ae",
                  "nameSingular": "calendarChannelEventAssociation",
                  "namePlural": "calendarChannelEventAssociations"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "03e2c0cd-8836-430d-98e4-857fcd9d3ef8",
                  "name": "calendarChannelEventAssociations"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "b12990c5-85a5-431f-b830-78ae5cf83fac",
                  "name": "calendarChannel"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "056a8284-3dd0-49b9-b1a9-fe0a5615dfff",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "messageFolder",
          "namePlural": "messageFolders",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "c7f333be-2de9-4042-82b6-010db0e4a051",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Message Folder",
          "labelPlural": "Message Folders",
          "description": "Folder for Message Channel",
          "icon": "IconFolder",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "f0a28d8a-6f51-48c7-b467-897cefb7d375",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Name",
              "description": "Folder name",
              "icon": "IconFolder"
            },
            {
              "__typename": "Field",
              "id": "3213642d-36f6-4379-a617-fbab6eba93fe",
              "type": "TEXT",
              "name": "syncCursor",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Sync Cursor",
              "description": "Sync Cursor",
              "icon": "IconHash"
            },
            {
              "__typename": "Field",
              "id": "c7f333be-2de9-4042-82b6-010db0e4a051",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "cb08d0e0-ab7d-4a92-964f-9bf9a9522c4c",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "7733b046-3f65-40d7-9fb3-978c7e8e4b74",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "f28efb73-8a54-41b7-a061-a0d99014cff6",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "fc89ca96-4c23-4588-a5bf-9276b2cc6d1d",
              "type": "RELATION",
              "name": "messageChannel",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "messageChannelId"
              },
              "isLabelSyncedWithName": false,
              "label": "Message Channel",
              "description": "Message Channel",
              "icon": "IconMessage",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "056a8284-3dd0-49b9-b1a9-fe0a5615dfff",
                  "nameSingular": "messageFolder",
                  "namePlural": "messageFolders"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4ccdf309-8939-4852-ac6d-4a2691cde89e",
                  "nameSingular": "messageChannel",
                  "namePlural": "messageChannels"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "fc89ca96-4c23-4588-a5bf-9276b2cc6d1d",
                  "name": "messageChannel"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "07d1c561-6c13-45f7-9385-207590988acf",
                  "name": "messageFolders"
                }
              }
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "033ed93d-339f-4c5d-9fe8-846abc0972ae",
          "dataSourceId": "4ec31e89-e307-4040-be73-c2bfa042163a",
          "nameSingular": "calendarChannelEventAssociation",
          "namePlural": "calendarChannelEventAssociations",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "createdAt": "2025-06-06T14:42:51.895Z",
          "updatedAt": "2025-06-06T14:42:51.895Z",
          "labelIdentifierFieldMetadataId": "531dbe1a-e2ee-4a95-ac63-b4c4e5326983",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Calendar Channel Event Association",
          "labelPlural": "Calendar Channel Event Associations",
          "description": "Calendar Channel Event Associations",
          "icon": "IconCalendar",
          "indexMetadatas": {
            "__typename": "ObjectIndexMetadatasConnection",
            "edges": []
          },
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "79cdfafc-4ecd-422a-b915-3e8f957fcd13",
              "type": "TEXT",
              "name": "eventExternalId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Event external ID",
              "description": "Event external ID",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "b957055b-964e-44dc-aeb4-ec7b47c2a1e5",
              "type": "TEXT",
              "name": "recurringEventExternalId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Recurring Event ID",
              "description": "Recurring Event ID",
              "icon": "IconHistory"
            },
            {
              "__typename": "Field",
              "id": "531dbe1a-e2ee-4a95-ac63-b4c4e5326983",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "uuid",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Id",
              "description": "Id",
              "icon": "Icon123"
            },
            {
              "__typename": "Field",
              "id": "873d423a-f3b9-4791-8432-ff67a0f96e76",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Creation date",
              "description": "Creation date",
              "icon": "IconCalendar"
            },
            {
              "__typename": "Field",
              "id": "b1005cf5-11f7-41f4-a02d-532fe82cf63a",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": "now",
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Last update",
              "description": "Last time the record was changed",
              "icon": "IconCalendarClock"
            },
            {
              "__typename": "Field",
              "id": "6c3c0860-edd9-42fa-977f-d9588ef47b01",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "displayFormat": "RELATIVE"
              },
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Deleted at",
              "description": "Date when the record was deleted",
              "icon": "IconCalendarMinus"
            },
            {
              "__typename": "Field",
              "id": "b12990c5-85a5-431f-b830-78ae5cf83fac",
              "type": "RELATION",
              "name": "calendarChannel",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "calendarChannelId"
              },
              "isLabelSyncedWithName": false,
              "label": "Channel ID",
              "description": "Channel ID",
              "icon": "IconCalendar",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "033ed93d-339f-4c5d-9fe8-846abc0972ae",
                  "nameSingular": "calendarChannelEventAssociation",
                  "namePlural": "calendarChannelEventAssociations"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "0a927681-9662-45ea-9254-e21eea85305d",
                  "nameSingular": "calendarChannel",
                  "namePlural": "calendarChannels"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "b12990c5-85a5-431f-b830-78ae5cf83fac",
                  "name": "calendarChannel"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "03e2c0cd-8836-430d-98e4-857fcd9d3ef8",
                  "name": "calendarChannelEventAssociations"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "f2711264-d589-4c7c-b7ee-5c7650236f77",
              "type": "RELATION",
              "name": "calendarEvent",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-06T14:42:51.895Z",
              "updatedAt": "2025-06-06T14:42:51.895Z",
              "defaultValue": null,
              "options": null,
              "settings": {
                "onDelete": "CASCADE",
                "relationType": "MANY_TO_ONE",
                "joinColumnName": "calendarEventId"
              },
              "isLabelSyncedWithName": false,
              "label": "Event ID",
              "description": "Event ID",
              "icon": "IconCalendar",
              "relation": {
                "__typename": "Relation",
                "type": "MANY_TO_ONE",
                "sourceObjectMetadata": {
                  "__typename": "Object",
                  "id": "033ed93d-339f-4c5d-9fe8-846abc0972ae",
                  "nameSingular": "calendarChannelEventAssociation",
                  "namePlural": "calendarChannelEventAssociations"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "adc935a0-5b4f-4dc1-a4c1-6b411c9afaa2",
                  "nameSingular": "calendarEvent",
                  "namePlural": "calendarEvents"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "f2711264-d589-4c7c-b7ee-5c7650236f77",
                  "name": "calendarEvent"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "d0532282-ad17-4237-997c-dea0e4224dca",
                  "name": "calendarChannelEventAssociations"
                }
              }
            }
          ]
        }
      }
    ]
  }
} as ObjectMetadataItemsQuery;
