/* eslint-disable */
import { ObjectMetadataItemsQuery } from '~/generated-metadata/graphql';

// This file is not designed to be manually edited.
// It's an extract from the dev seeded environment metadata call
// TODO: automate the generation of this file

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
          "id": "fac890af-68c5-4718-a16b-7401b1868429",
          "nameSingular": "workflowRun",
          "namePlural": "workflowRuns",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": false,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "69f9f64c-30ab-4a19-93a2-29596b6046c0",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Workflow Run",
          "labelPlural": "Workflow Runs",
          "description": "A workflow run",
          "icon": "IconHistoryToggle",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "69f9f64c-30ab-4a19-93a2-29596b6046c0",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "f9f152d1-e827-41bb-af5f-6a08a4ba9d6b",
              "type": "DATE_TIME",
              "name": "startedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "2ad35021-b87f-43ac-8b48-ee7fc5b56387",
              "type": "DATE_TIME",
              "name": "endedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "4221dd27-6e2b-4f5a-adb6-1ecbf52392fa",
              "type": "SELECT",
              "name": "status",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": "'NOT_STARTED'",
              "options": [
                {
                  "id": "6b07cf46-637b-4164-a814-c756562bb6f1",
                  "color": "gray",
                  "label": "Not started",
                  "value": "NOT_STARTED",
                  "position": 0
                },
                {
                  "id": "a9c9cae1-aa3b-409c-8256-8efd5ffbef76",
                  "color": "yellow",
                  "label": "Running",
                  "value": "RUNNING",
                  "position": 1
                },
                {
                  "id": "ef356068-ef37-4898-889e-797e3a66ad51",
                  "color": "green",
                  "label": "Completed",
                  "value": "COMPLETED",
                  "position": 2
                },
                {
                  "id": "7e3b06ef-5991-4528-a5c0-ed127f8304b1",
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
              "id": "5bc4e957-6bbe-4481-8225-cf88f6b7ed4d",
              "type": "ACTOR",
              "name": "createdBy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "ba9595db-5f25-4fef-b0d7-c72dd63f9cc4",
              "type": "RAW_JSON",
              "name": "output",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "c1684ba7-c722-4839-9811-cd5af1d02ec2",
              "type": "RAW_JSON",
              "name": "context",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "c47c0563-c7ff-4388-9bae-8db61f5d690e",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "da4ab897-ea4d-45f7-8e9f-cf92080b6aaa",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "a72cad66-b9e5-4793-a032-023b607f3dfe",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "ce433cdf-5a1c-4827-a217-a398705c3720",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "6c4525cc-84b8-46e3-84d9-bf840eef10a2",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "f26aee9e-883a-46d2-938b-8db3061ba579",
              "type": "RELATION",
              "name": "workflowVersion",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "fac890af-68c5-4718-a16b-7401b1868429",
                  "nameSingular": "workflowRun",
                  "namePlural": "workflowRuns"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4534bb30-62fb-46fd-899b-c03348acd97a",
                  "nameSingular": "workflowVersion",
                  "namePlural": "workflowVersions"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "f26aee9e-883a-46d2-938b-8db3061ba579",
                  "name": "workflowVersion"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "b960652a-142e-4772-9011-f261e66e59fe",
                  "name": "runs"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "1a7584bc-5f3a-466c-ad24-587eda39b8f3",
              "type": "RELATION",
              "name": "workflow",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "fac890af-68c5-4718-a16b-7401b1868429",
                  "nameSingular": "workflowRun",
                  "namePlural": "workflowRuns"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "3d041dc9-e4f0-4cd0-ad45-7d15080c4ac7",
                  "nameSingular": "workflow",
                  "namePlural": "workflows"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "1a7584bc-5f3a-466c-ad24-587eda39b8f3",
                  "name": "workflow"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "4608fc82-1fcf-46f4-bc14-86bfbbe0f47d",
                  "name": "runs"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "79f05bdb-1efb-4079-ab9d-a0d38fca8448",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "fac890af-68c5-4718-a16b-7401b1868429",
                  "nameSingular": "workflowRun",
                  "namePlural": "workflowRuns"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "79f05bdb-1efb-4079-ab9d-a0d38fca8448",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "abd0bed2-d856-4fb3-8396-2e750d377ff1",
                  "name": "workflowRun"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "fe09259f-de35-4e8d-83b4-1c1137c16fd4",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "fac890af-68c5-4718-a16b-7401b1868429",
                  "nameSingular": "workflowRun",
                  "namePlural": "workflowRuns"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "fe09259f-de35-4e8d-83b4-1c1137c16fd4",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "3ed67245-68ed-4452-9453-cfa21e16e1cc",
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
          "id": "f8022881-1190-4760-8107-309648f32024",
          "nameSingular": "noteTarget",
          "namePlural": "noteTargets",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "c9708416-60bf-43c8-989e-3adfd7ed4977",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Note Target",
          "labelPlural": "Note Targets",
          "description": "A note target",
          "icon": "IconCheckbox",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "c9708416-60bf-43c8-989e-3adfd7ed4977",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "0a6e602a-0a1f-43ab-935d-e3cac263fdd8",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "1952e980-dc4c-4c94-806a-e57437e2408a",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "5476b4ad-b024-4345-8bae-0ccc94532cb3",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "0500ed2f-0c98-4524-bc11-1d946ea5162c",
              "type": "RELATION",
              "name": "note",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "f8022881-1190-4760-8107-309648f32024",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "46d270fd-7b29-4a75-9943-27c8594b1f3c",
                  "nameSingular": "note",
                  "namePlural": "notes"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "0500ed2f-0c98-4524-bc11-1d946ea5162c",
                  "name": "note"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "f08cc9b1-eba9-402b-bc0a-f7351fc19361",
                  "name": "noteTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "94c251a4-a8b9-4f84-812b-4b68297ea465",
              "type": "RELATION",
              "name": "person",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "f8022881-1190-4760-8107-309648f32024",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "6f3b9df6-57c0-4fe0-b8af-1a5ed20d76bd",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "94c251a4-a8b9-4f84-812b-4b68297ea465",
                  "name": "person"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "1d36023f-cfae-491e-bf86-a4768d97b100",
                  "name": "noteTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "17aa0682-1cd2-4b4d-91f4-70a1aecfd39e",
              "type": "RELATION",
              "name": "company",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "f8022881-1190-4760-8107-309648f32024",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4a45f524-b8cb-40e8-8450-28e402b442cf",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "17aa0682-1cd2-4b4d-91f4-70a1aecfd39e",
                  "name": "company"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "60d04ca2-1122-4249-9091-547202f1e8d2",
                  "name": "noteTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "3db5112b-eb5b-466c-9dca-37a319e05448",
              "type": "RELATION",
              "name": "opportunity",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "f8022881-1190-4760-8107-309648f32024",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "641f0c5f-bb3d-4a8f-8a35-45f769027d41",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "3db5112b-eb5b-466c-9dca-37a319e05448",
                  "name": "opportunity"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "c7ac121d-f492-4d06-b4ba-264396172dcb",
                  "name": "noteTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "5f5cc0c7-534f-4a43-8f9b-a78a5e32c0fe",
              "type": "RELATION",
              "name": "rocket",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:50.890Z",
              "updatedAt": "2025-06-09T18:53:50.890Z",
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
                  "id": "f8022881-1190-4760-8107-309648f32024",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "c73c0408-222b-4214-a855-f6bb88ee8ebc",
                  "nameSingular": "rocket",
                  "namePlural": "rockets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "5f5cc0c7-534f-4a43-8f9b-a78a5e32c0fe",
                  "name": "rocket"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "5795845a-5b56-485c-ba18-b989fcd2c7c4",
                  "name": "noteTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "302f2a25-0661-4e15-b258-b1a5bdd0446c",
              "type": "RELATION",
              "name": "pet",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.337Z",
              "updatedAt": "2025-06-09T18:53:51.337Z",
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
                  "id": "f8022881-1190-4760-8107-309648f32024",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "62855e83-6d97-4c48-bffc-c17e8e955820",
                  "nameSingular": "pet",
                  "namePlural": "pets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "302f2a25-0661-4e15-b258-b1a5bdd0446c",
                  "name": "pet"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "9b15e22f-72e4-454f-928a-aecbd4b70b4c",
                  "name": "noteTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "e2a2856b-1b86-4a5b-9561-e35d430ef18a",
              "type": "RELATION",
              "name": "surveyResult",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.520Z",
              "updatedAt": "2025-06-09T18:53:52.520Z",
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
                  "id": "f8022881-1190-4760-8107-309648f32024",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "e58c0a80-38c6-4d18-85b6-7d1e2ad52443",
                  "nameSingular": "surveyResult",
                  "namePlural": "surveyResults"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "e2a2856b-1b86-4a5b-9561-e35d430ef18a",
                  "name": "surveyResult"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "b1d902f5-32f4-41fd-ab10-c545c597b33a",
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
          "id": "c8956380-304b-40ba-8c1d-de5ed23359d0",
          "nameSingular": "dashboard",
          "namePlural": "dashboards",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z",
          "labelIdentifierFieldMetadataId": "953265d2-718b-4f62-9c27-e8846918a649",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Dashboard",
          "labelPlural": "Dashboards",
          "description": "A dashboard",
          "icon": "IconChartBar",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "dashboard-id-field",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2024-01-01T00:00:00.000Z",
              "updatedAt": "2024-01-01T00:00:00.000Z",
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
              "id": "953265d2-718b-4f62-9c27-e8846918a649",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2024-01-01T00:00:00.000Z",
              "updatedAt": "2024-01-01T00:00:00.000Z",
              "defaultValue": "''",
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Name",
              "description": "Dashboard name",
              "icon": "IconChartBar"
            },
            {
              "__typename": "Field",
              "id": "dashboard-createdAt-field",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2024-01-01T00:00:00.000Z",
              "updatedAt": "2024-01-01T00:00:00.000Z",
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
              "id": "dashboard-updatedAt-field",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2024-01-01T00:00:00.000Z",
              "updatedAt": "2024-01-01T00:00:00.000Z",
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
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "e58c0a80-38c6-4d18-85b6-7d1e2ad52443",
          "nameSingular": "surveyResult",
          "namePlural": "surveyResults",
          "isCustom": true,
          "isRemote": false,
          "isActive": true,
          "isSystem": false,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:52.492Z",
          "updatedAt": "2025-06-09T18:53:52.516Z",
          "labelIdentifierFieldMetadataId": "74f7f0ad-6f42-430f-ac26-4ec0ea4b29cf",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": true,
          "duplicateCriteria": null,
          "labelSingular": "Survey result",
          "labelPlural": "Survey results",
          "description": null,
          "icon": "IconRulerMeasure",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "8163eab2-3a22-4d63-9b7a-e233ae51f995",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.520Z",
              "updatedAt": "2025-06-09T18:53:52.520Z",
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
                  "id": "e58c0a80-38c6-4d18-85b6-7d1e2ad52443",
                  "nameSingular": "surveyResult",
                  "namePlural": "surveyResults"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "8163eab2-3a22-4d63-9b7a-e233ae51f995",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "b129cd82-41f3-43ca-a527-6365a0cf7090",
                  "name": "surveyResult"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "9c169852-bee1-460d-98b5-651be2542395",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.492Z",
              "updatedAt": "2025-06-09T18:53:52.492Z",
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
              "id": "74f7f0ad-6f42-430f-ac26-4ec0ea4b29cf",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.492Z",
              "updatedAt": "2025-06-09T18:53:52.492Z",
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
              "id": "40e223e3-92c0-4d3e-a80b-2cd1d1bb2832",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.492Z",
              "updatedAt": "2025-06-09T18:53:52.492Z",
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
              "id": "e8de3fc3-54ae-466b-accb-7a0c3cd05464",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.492Z",
              "updatedAt": "2025-06-09T18:53:52.492Z",
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
              "id": "2234209a-0065-4671-ad3b-a2a2c3928f8a",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.492Z",
              "updatedAt": "2025-06-09T18:53:52.492Z",
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
              "id": "611c7567-40cb-468c-bfd3-03641b728181",
              "type": "ACTOR",
              "name": "createdBy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.492Z",
              "updatedAt": "2025-06-09T18:53:52.492Z",
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
              "id": "178f19e1-7698-4ede-a2b9-87c059b9eb56",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.492Z",
              "updatedAt": "2025-06-09T18:53:52.492Z",
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
              "id": "45087d5a-372a-457b-b39e-0a973bd9bd97",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.520Z",
              "updatedAt": "2025-06-09T18:53:52.520Z",
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
                  "id": "e58c0a80-38c6-4d18-85b6-7d1e2ad52443",
                  "nameSingular": "surveyResult",
                  "namePlural": "surveyResults"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "45087d5a-372a-457b-b39e-0a973bd9bd97",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "d983cb00-c992-429a-a536-69d99e0eee14",
                  "name": "surveyResult"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "b1d902f5-32f4-41fd-ab10-c545c597b33a",
              "type": "RELATION",
              "name": "noteTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.520Z",
              "updatedAt": "2025-06-09T18:53:52.520Z",
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
                  "id": "e58c0a80-38c6-4d18-85b6-7d1e2ad52443",
                  "nameSingular": "surveyResult",
                  "namePlural": "surveyResults"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "f8022881-1190-4760-8107-309648f32024",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "b1d902f5-32f4-41fd-ab10-c545c597b33a",
                  "name": "noteTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "e2a2856b-1b86-4a5b-9561-e35d430ef18a",
                  "name": "surveyResult"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "8f4633cd-b642-4238-a3e7-76bba59f075c",
              "type": "RELATION",
              "name": "attachments",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.520Z",
              "updatedAt": "2025-06-09T18:53:52.520Z",
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
                  "id": "e58c0a80-38c6-4d18-85b6-7d1e2ad52443",
                  "nameSingular": "surveyResult",
                  "namePlural": "surveyResults"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "a0a44046-66f1-456a-9133-1f78ac60b9ca",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "8f4633cd-b642-4238-a3e7-76bba59f075c",
                  "name": "attachments"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "40f37c0d-99f5-49a4-b57f-18fbeeb07757",
                  "name": "surveyResult"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "a4c055c6-df30-4cdf-9622-3d3db93b4337",
              "type": "TS_VECTOR",
              "name": "searchVector",
              "isCustom": false,
              "isActive": false,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.545Z",
              "updatedAt": "2025-06-09T18:53:52.545Z",
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
              "id": "df47aa15-c29d-40a0-ac2a-5f3de6917e05",
              "type": "NUMBER",
              "name": "score",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.933Z",
              "updatedAt": "2025-06-09T18:53:52.933Z",
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
              "id": "5fda8ecf-397a-4547-84f8-811b5051db79",
              "type": "NUMBER",
              "name": "percentageOfCompletion",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.934Z",
              "updatedAt": "2025-06-09T18:53:52.934Z",
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
              "id": "1de0eae5-1336-4781-bd70-37456911bdf5",
              "type": "NUMBER",
              "name": "participants",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.936Z",
              "updatedAt": "2025-06-09T18:53:52.936Z",
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
              "id": "4998ea2f-d943-46f8-99f6-cd48af79187f",
              "type": "NUMBER",
              "name": "averageEstimatedNumberOfAtomsInTheUniverse",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.937Z",
              "updatedAt": "2025-06-09T18:53:52.937Z",
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
              "id": "2026d762-1ed3-4034-830b-9e658c4bca8c",
              "type": "TEXT",
              "name": "comments",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.938Z",
              "updatedAt": "2025-06-09T18:53:52.938Z",
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
              "id": "7738ef9a-a310-4b1d-8c9c-ad17e213c7fa",
              "type": "TEXT",
              "name": "shortNotes",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.938Z",
              "updatedAt": "2025-06-09T18:53:52.938Z",
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
              "id": "ea4ca74a-498e-4af8-91b1-e6d9e1f85c4c",
              "type": "RELATION",
              "name": "taskTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.521Z",
              "updatedAt": "2025-06-09T18:53:52.521Z",
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
                  "id": "e58c0a80-38c6-4d18-85b6-7d1e2ad52443",
                  "nameSingular": "surveyResult",
                  "namePlural": "surveyResults"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "7ae7e7ef-6985-4606-bbe3-b76e97b93524",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "ea4ca74a-498e-4af8-91b1-e6d9e1f85c4c",
                  "name": "taskTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "393c9bb2-b10a-4fd6-a7a7-88095e7c648f",
                  "name": "surveyResult"
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
          "id": "df24f198-ac9c-4e00-b5c8-6dec9a413610",
          "nameSingular": "apiKey",
          "namePlural": "apiKeys",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "8156ee7f-7d5e-49a2-acd6-8891d448d60a",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "API Key",
          "labelPlural": "API Keys",
          "description": "An API key",
          "icon": "IconRobot",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "8156ee7f-7d5e-49a2-acd6-8891d448d60a",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "60e05849-fe26-44db-82a2-fbefa2565f5b",
              "type": "DATE_TIME",
              "name": "expiresAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "2213b36b-0d1a-4b4c-add3-1e607f73775e",
              "type": "DATE_TIME",
              "name": "revokedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "cf2a21c5-ec31-4b1f-b29b-d5516a345a7f",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "2b9e8e19-1aa5-42fc-81ba-31363fd4f007",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "6a4d9374-4ed3-455a-8003-3f310f2327a1",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "a16ae3ec-ece0-4ca2-83c7-30dffcc5647d",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
          "id": "d7802b9b-71f5-4ae9-9d52-6d1aca373a2b",
          "nameSingular": "viewFilterGroup",
          "namePlural": "viewFilterGroups",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "a33dc2c3-cc88-4e23-9865-34c92c3a5dc3",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "View Filter Group",
          "labelPlural": "View Filter Groups",
          "description": "(System) View Filter Groups",
          "icon": "IconFilterBolt",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "40b89ee4-240a-4f49-90e9-d73fbd94ed26",
              "type": "UUID",
              "name": "parentViewFilterGroupId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "85a3d3b6-63f1-4c3e-8d71-035ba06a09f9",
              "type": "SELECT",
              "name": "logicalOperator",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": "'NOT'",
              "options": [
                {
                  "id": "85f3c0a8-23d2-4778-bdfe-33697a443fc4",
                  "color": "blue",
                  "label": "AND",
                  "value": "AND",
                  "position": 0
                },
                {
                  "id": "b1711128-4140-4a1f-9129-caf5e504f8b1",
                  "color": "green",
                  "label": "OR",
                  "value": "OR",
                  "position": 1
                },
                {
                  "id": "c4e0ffc1-047a-4aa0-88c9-2574d10f45e0",
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
              "id": "2ed8746a-7cc5-42c9-94df-6513b75eaf93",
              "type": "NUMBER",
              "name": "positionInViewFilterGroup",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "a33dc2c3-cc88-4e23-9865-34c92c3a5dc3",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "8b4a1c7f-ea69-4892-87af-d3d5bd79a04a",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "429087ec-0f9a-4d02-813f-248ef4c949e4",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "95130b58-e22f-44ea-9c25-e16690cda4d4",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "7a74a91b-5e05-4449-9595-dfd634d133b6",
              "type": "RELATION",
              "name": "view",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "d7802b9b-71f5-4ae9-9d52-6d1aca373a2b",
                  "nameSingular": "viewFilterGroup",
                  "namePlural": "viewFilterGroups"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "c4b95b85-3b53-4b33-94f2-58a2b5abb746",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "7a74a91b-5e05-4449-9595-dfd634d133b6",
                  "name": "view"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "668c57be-d876-4bbe-bf09-5c86d979c919",
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
          "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
          "nameSingular": "timelineActivity",
          "namePlural": "timelineActivities",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "2dda0482-1274-43cf-887c-196aca5732ac",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Timeline Activity",
          "labelPlural": "Timeline Activities",
          "description": "Aggregated / filtered event to be displayed on the timeline",
          "icon": "IconTimelineEvent",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "fc5dd779-4990-4a31-a119-eecc01d5a52e",
              "type": "DATE_TIME",
              "name": "happensAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "37aa405b-0c5c-4796-ba65-50f9457673ce",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "c12fc1bf-ffff-4893-9d24-c6113c25f3cd",
              "type": "RAW_JSON",
              "name": "properties",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "30fb98af-f10e-44da-b9fd-16226ba43c3d",
              "type": "TEXT",
              "name": "linkedRecordCachedName",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "7dadabe4-28bc-42fe-8569-9e43a4f52795",
              "type": "UUID",
              "name": "linkedRecordId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "62a5d19c-69c0-4b40-94e3-c90c7dc0ca76",
              "type": "UUID",
              "name": "linkedObjectMetadataId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "2dda0482-1274-43cf-887c-196aca5732ac",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "508abd61-5f61-4879-acb5-7944cd6aee24",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "04e58492-b393-4641-a8a6-fc1e49a0f98e",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "dfe57802-ba3d-4205-9d33-33e179843c25",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "49381568-46d2-472e-b3dd-712a5ecbc91f",
              "type": "RELATION",
              "name": "workspaceMember",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "369081b1-70a6-4fc6-9e50-f0b12841549d",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "49381568-46d2-472e-b3dd-712a5ecbc91f",
                  "name": "workspaceMember"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "bbd2f2ea-e5de-4494-8f14-f3233ff751c0",
                  "name": "timelineActivities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "3e88da0b-1d84-43d3-b75e-8e7b55ef423c",
              "type": "RELATION",
              "name": "person",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "6f3b9df6-57c0-4fe0-b8af-1a5ed20d76bd",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "3e88da0b-1d84-43d3-b75e-8e7b55ef423c",
                  "name": "person"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "a0c65226-6ea1-4324-8abf-a2a91a9a6c75",
                  "name": "timelineActivities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "873e176a-fc0b-42cb-b4d2-4c11569e4c18",
              "type": "RELATION",
              "name": "company",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4a45f524-b8cb-40e8-8450-28e402b442cf",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "873e176a-fc0b-42cb-b4d2-4c11569e4c18",
                  "name": "company"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "5f5b9615-6773-4dff-9913-c437685a704b",
                  "name": "timelineActivities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "477a0642-da68-4aff-94a6-f55a4d53337b",
              "type": "RELATION",
              "name": "opportunity",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "641f0c5f-bb3d-4a8f-8a35-45f769027d41",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "477a0642-da68-4aff-94a6-f55a4d53337b",
                  "name": "opportunity"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "ebc969ed-a08d-4e56-a6df-9d98930faa84",
                  "name": "timelineActivities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "394a9497-491c-49f5-a8a4-d5f74e9003f3",
              "type": "RELATION",
              "name": "note",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "46d270fd-7b29-4a75-9943-27c8594b1f3c",
                  "nameSingular": "note",
                  "namePlural": "notes"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "394a9497-491c-49f5-a8a4-d5f74e9003f3",
                  "name": "note"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "503766e0-f1d2-4702-b6bf-c301a19582fa",
                  "name": "timelineActivities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "b13e5081-f064-4be1-bfe5-48f5e1ed2d62",
              "type": "RELATION",
              "name": "task",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "83b1dd88-82e5-4d8c-b52b-81e5302adf58",
                  "nameSingular": "task",
                  "namePlural": "tasks"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "b13e5081-f064-4be1-bfe5-48f5e1ed2d62",
                  "name": "task"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "6c0e54d4-0ae2-4aba-9bbb-fa176bb60add",
                  "name": "timelineActivities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "e79188eb-d3a0-4c26-aeab-c37f4b675966",
              "type": "RELATION",
              "name": "workflow",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "3d041dc9-e4f0-4cd0-ad45-7d15080c4ac7",
                  "nameSingular": "workflow",
                  "namePlural": "workflows"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "e79188eb-d3a0-4c26-aeab-c37f4b675966",
                  "name": "workflow"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "1bedb47b-1bdd-4d01-bd99-6382b707f5a3",
                  "name": "timelineActivities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "57c2fbe0-ec1d-49c9-ba4e-c7c024a8f400",
              "type": "RELATION",
              "name": "workflowVersion",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4534bb30-62fb-46fd-899b-c03348acd97a",
                  "nameSingular": "workflowVersion",
                  "namePlural": "workflowVersions"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "57c2fbe0-ec1d-49c9-ba4e-c7c024a8f400",
                  "name": "workflowVersion"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "440f9262-bd36-42f3-b90d-b79632b4790c",
                  "name": "timelineActivities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "3ed67245-68ed-4452-9453-cfa21e16e1cc",
              "type": "RELATION",
              "name": "workflowRun",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "fac890af-68c5-4718-a16b-7401b1868429",
                  "nameSingular": "workflowRun",
                  "namePlural": "workflowRuns"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "3ed67245-68ed-4452-9453-cfa21e16e1cc",
                  "name": "workflowRun"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "fe09259f-de35-4e8d-83b4-1c1137c16fd4",
                  "name": "timelineActivities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "fcecfd43-5fdb-4414-b05a-7888b0afe39e",
              "type": "RELATION",
              "name": "rocket",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:50.886Z",
              "updatedAt": "2025-06-09T18:53:50.886Z",
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
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "c73c0408-222b-4214-a855-f6bb88ee8ebc",
                  "nameSingular": "rocket",
                  "namePlural": "rockets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "fcecfd43-5fdb-4414-b05a-7888b0afe39e",
                  "name": "rocket"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "cdcf6aa3-55c5-4b33-83c4-1ad75871d9c5",
                  "name": "timelineActivities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "ccd688fd-77b7-44a6-b723-ef81aba000e2",
              "type": "RELATION",
              "name": "pet",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.337Z",
              "updatedAt": "2025-06-09T18:53:51.337Z",
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
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "62855e83-6d97-4c48-bffc-c17e8e955820",
                  "nameSingular": "pet",
                  "namePlural": "pets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "ccd688fd-77b7-44a6-b723-ef81aba000e2",
                  "name": "pet"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "6bcc33d7-e4f3-4f24-a24a-903297c99f4a",
                  "name": "timelineActivities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "d983cb00-c992-429a-a536-69d99e0eee14",
              "type": "RELATION",
              "name": "surveyResult",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.520Z",
              "updatedAt": "2025-06-09T18:53:52.520Z",
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
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "e58c0a80-38c6-4d18-85b6-7d1e2ad52443",
                  "nameSingular": "surveyResult",
                  "namePlural": "surveyResults"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "d983cb00-c992-429a-a536-69d99e0eee14",
                  "name": "surveyResult"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "45087d5a-372a-457b-b39e-0a973bd9bd97",
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
          "id": "cbe0ae42-a8f4-4166-817b-96e647aae5dd",
          "nameSingular": "messageThread",
          "namePlural": "messageThreads",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "76d4c949-95d0-4968-90eb-bc84ce7fd172",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Message Thread",
          "labelPlural": "Message Threads",
          "description": "A group of related messages (e.g. email thread, chat thread)",
          "icon": "IconMessage",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "76d4c949-95d0-4968-90eb-bc84ce7fd172",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "138560c6-54e9-4c1d-b2bf-40fccca30d98",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "f05440c4-da21-4588-9f92-b475615aca9c",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "054046f3-3926-4b0a-bc44-49e9b990606a",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "a48c2807-443d-41c7-8a37-8f211a6372ba",
              "type": "RELATION",
              "name": "messages",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "cbe0ae42-a8f4-4166-817b-96e647aae5dd",
                  "nameSingular": "messageThread",
                  "namePlural": "messageThreads"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "04dc5940-3a62-4536-ad57-c96f913cf67b",
                  "nameSingular": "message",
                  "namePlural": "messages"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "a48c2807-443d-41c7-8a37-8f211a6372ba",
                  "name": "messages"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "f2dc3f17-b0e1-4910-927f-e92f05e42e33",
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
          "id": "cad90776-17ac-4b9b-a3cd-43a6eb0b4d46",
          "nameSingular": "viewGroup",
          "namePlural": "viewGroups",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "f77a936e-89bd-4e28-bddf-2448753b2575",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "View Group",
          "labelPlural": "View Groups",
          "description": "(System) View Groups",
          "icon": "IconTag",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "8d66bb04-cb06-40dd-97d1-bbe507ad642a",
              "type": "UUID",
              "name": "fieldMetadataId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "887e7bad-7805-4cb8-8c28-8c2ee1d0adaa",
              "type": "BOOLEAN",
              "name": "isVisible",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "84e57515-d65f-46e4-b6a8-04009167528e",
              "type": "TEXT",
              "name": "fieldValue",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "95cc6a71-5f1b-4a1b-b357-6a73c74e206f",
              "type": "NUMBER",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "f77a936e-89bd-4e28-bddf-2448753b2575",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "4aed6954-d58d-45ac-b6d4-c1e55c98d094",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "5d7b7fca-b737-4f48-a5b6-d7d3b316f7b3",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "d2c54e2e-9e33-455c-9a9a-6349206fbdea",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "9376e026-5d61-4577-92f9-e02700bdda68",
              "type": "RELATION",
              "name": "view",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "cad90776-17ac-4b9b-a3cd-43a6eb0b4d46",
                  "nameSingular": "viewGroup",
                  "namePlural": "viewGroups"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "c4b95b85-3b53-4b33-94f2-58a2b5abb746",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "9376e026-5d61-4577-92f9-e02700bdda68",
                  "name": "view"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "57d6b91e-cd37-49a3-8660-24c34b336936",
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
          "id": "c73c0408-222b-4214-a855-f6bb88ee8ebc",
          "nameSingular": "rocket",
          "namePlural": "rockets",
          "isCustom": true,
          "isRemote": false,
          "isActive": true,
          "isSystem": false,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:50.879Z",
          "updatedAt": "2025-06-09T18:53:50.881Z",
          "labelIdentifierFieldMetadataId": "cd48fb0f-0a7c-4515-8475-91d7cff13940",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": true,
          "duplicateCriteria": null,
          "labelSingular": "Rocket",
          "labelPlural": "Rockets",
          "description": "A rocket",
          "icon": "IconRocket",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "f1fe2a8b-3106-46f7-9863-3203dc569621",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:50.879Z",
              "updatedAt": "2025-06-09T18:53:50.879Z",
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
              "id": "370ab5c7-1670-4141-acad-867df808464e",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:50.879Z",
              "updatedAt": "2025-06-09T18:53:50.879Z",
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
              "id": "8a5a4474-979a-46a5-8053-60e1e3b588da",
              "type": "ACTOR",
              "name": "createdBy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:50.879Z",
              "updatedAt": "2025-06-09T18:53:50.879Z",
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
              "id": "d518d7a9-4030-4494-82e3-e7ac00394bde",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:50.879Z",
              "updatedAt": "2025-06-09T18:53:50.879Z",
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
              "id": "cdcf6aa3-55c5-4b33-83c4-1ad75871d9c5",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:50.886Z",
              "updatedAt": "2025-06-09T18:53:50.886Z",
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
                  "id": "c73c0408-222b-4214-a855-f6bb88ee8ebc",
                  "nameSingular": "rocket",
                  "namePlural": "rockets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "cdcf6aa3-55c5-4b33-83c4-1ad75871d9c5",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "fcecfd43-5fdb-4414-b05a-7888b0afe39e",
                  "name": "rocket"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "d76f1516-46ee-4947-887d-be1ea137d09d",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:50.879Z",
              "updatedAt": "2025-06-09T18:53:50.879Z",
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
              "id": "cd48fb0f-0a7c-4515-8475-91d7cff13940",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:50.879Z",
              "updatedAt": "2025-06-09T18:53:50.879Z",
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
              "id": "6a5059e4-deec-4c80-ba81-930673a7857a",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:50.879Z",
              "updatedAt": "2025-06-09T18:53:50.879Z",
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
              "id": "b0df6dca-c0cd-4b7e-9f20-9dd31544fdb0",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:50.887Z",
              "updatedAt": "2025-06-09T18:53:50.887Z",
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
                  "id": "c73c0408-222b-4214-a855-f6bb88ee8ebc",
                  "nameSingular": "rocket",
                  "namePlural": "rockets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "b0df6dca-c0cd-4b7e-9f20-9dd31544fdb0",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "00de8998-a745-405e-9254-4f08005d9f66",
                  "name": "rocket"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "8ce9346a-698f-4870-a931-d4ef20c8fb99",
              "type": "RELATION",
              "name": "attachments",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:50.889Z",
              "updatedAt": "2025-06-09T18:53:50.889Z",
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
                  "id": "c73c0408-222b-4214-a855-f6bb88ee8ebc",
                  "nameSingular": "rocket",
                  "namePlural": "rockets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "a0a44046-66f1-456a-9133-1f78ac60b9ca",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "8ce9346a-698f-4870-a931-d4ef20c8fb99",
                  "name": "attachments"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "a9006098-f8ac-479a-b4c8-e60b50439531",
                  "name": "rocket"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "5795845a-5b56-485c-ba18-b989fcd2c7c4",
              "type": "RELATION",
              "name": "noteTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:50.890Z",
              "updatedAt": "2025-06-09T18:53:50.890Z",
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
                  "id": "c73c0408-222b-4214-a855-f6bb88ee8ebc",
                  "nameSingular": "rocket",
                  "namePlural": "rockets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "f8022881-1190-4760-8107-309648f32024",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "5795845a-5b56-485c-ba18-b989fcd2c7c4",
                  "name": "noteTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "5f5cc0c7-534f-4a43-8f9b-a78a5e32c0fe",
                  "name": "rocket"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "a858d85a-f3b4-47ff-a82c-e2dd4f106155",
              "type": "RELATION",
              "name": "taskTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:50.890Z",
              "updatedAt": "2025-06-09T18:53:50.890Z",
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
                  "id": "c73c0408-222b-4214-a855-f6bb88ee8ebc",
                  "nameSingular": "rocket",
                  "namePlural": "rockets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "7ae7e7ef-6985-4606-bbe3-b76e97b93524",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "a858d85a-f3b4-47ff-a82c-e2dd4f106155",
                  "name": "taskTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "98348674-2701-4300-83fc-26d26e8928cc",
                  "name": "rocket"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "683ab4d4-70fb-4fc9-a765-e77755a8f30e",
              "type": "TS_VECTOR",
              "name": "searchVector",
              "isCustom": false,
              "isActive": false,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:50.914Z",
              "updatedAt": "2025-06-09T18:53:50.914Z",
              "defaultValue": null,
              "options": null,
              "settings": null,
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Search vector",
              "description": "Field used for full-text search",
              "icon": ""
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "c5bdd9b9-06c5-450a-86b7-cb91f3c33b94",
          "nameSingular": "messageParticipant",
          "namePlural": "messageParticipants",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "b25e9bc9-e04f-482a-8e8c-0dfaa1549936",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Message Participant",
          "labelPlural": "Message Participants",
          "description": "Message Participants",
          "icon": "IconUserCircle",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "ceeccfe5-d8a2-42b8-9568-cfd596f04a8c",
              "type": "SELECT",
              "name": "role",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": "'FROM'",
              "options": [
                {
                  "id": "edc6f452-4ecc-4ff7-b30c-18575dbe0bfd",
                  "color": "green",
                  "label": "From",
                  "value": "from",
                  "position": 0
                },
                {
                  "id": "6c9f1924-7194-474b-92cc-964abafb2538",
                  "color": "blue",
                  "label": "To",
                  "value": "to",
                  "position": 1
                },
                {
                  "id": "56d201e9-5625-4dfa-b561-6640d56380dc",
                  "color": "orange",
                  "label": "Cc",
                  "value": "cc",
                  "position": 2
                },
                {
                  "id": "ca9d402f-b0a9-4a21-a497-db7fcd18483f",
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
              "id": "b25e9bc9-e04f-482a-8e8c-0dfaa1549936",
              "type": "TEXT",
              "name": "handle",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "d90fc4cd-53e1-4c6a-a011-ef166846daf5",
              "type": "TEXT",
              "name": "displayName",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "a0d08523-dfaa-4dde-a8a9-e1003eb6c7b4",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "b7f9af04-557e-4dab-8be7-20ab7638a3d0",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "b583630c-1a40-4aac-8936-c5000b400a69",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "a386e1e5-be42-4cef-a293-b3321c10cf4a",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "22682985-d10f-4f5f-bf2e-977babfd6b85",
              "type": "RELATION",
              "name": "message",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "c5bdd9b9-06c5-450a-86b7-cb91f3c33b94",
                  "nameSingular": "messageParticipant",
                  "namePlural": "messageParticipants"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "04dc5940-3a62-4536-ad57-c96f913cf67b",
                  "nameSingular": "message",
                  "namePlural": "messages"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "22682985-d10f-4f5f-bf2e-977babfd6b85",
                  "name": "message"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "fa1bcb96-3fce-45be-bff2-f7b1447bb35e",
                  "name": "messageParticipants"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "fe4bd25a-5bfb-4c3b-8947-af44cca0009a",
              "type": "RELATION",
              "name": "person",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "c5bdd9b9-06c5-450a-86b7-cb91f3c33b94",
                  "nameSingular": "messageParticipant",
                  "namePlural": "messageParticipants"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "6f3b9df6-57c0-4fe0-b8af-1a5ed20d76bd",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "fe4bd25a-5bfb-4c3b-8947-af44cca0009a",
                  "name": "person"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "7b26a561-1bc3-4a50-a340-3b0f21d28e47",
                  "name": "messageParticipants"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "1d843eae-0490-4518-aadd-97fda8fa3851",
              "type": "RELATION",
              "name": "workspaceMember",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "c5bdd9b9-06c5-450a-86b7-cb91f3c33b94",
                  "nameSingular": "messageParticipant",
                  "namePlural": "messageParticipants"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "369081b1-70a6-4fc6-9e50-f0b12841549d",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "1d843eae-0490-4518-aadd-97fda8fa3851",
                  "name": "workspaceMember"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "dc3e5858-3aa6-4d5d-8ff4-af658b6e6df1",
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
          "id": "c4b95b85-3b53-4b33-94f2-58a2b5abb746",
          "nameSingular": "view",
          "namePlural": "views",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "3c00f509-e1df-49c3-a672-f522262c0940",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "View",
          "labelPlural": "Views",
          "description": "(System) Views",
          "icon": "IconLayoutCollage",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "3c00f509-e1df-49c3-a672-f522262c0940",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "b2379ed8-7f4c-49f5-a517-9b25bd6fc761",
              "type": "UUID",
              "name": "objectMetadataId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "ce34d97e-8487-4fff-a642-3e7a222642ec",
              "type": "TEXT",
              "name": "type",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "37a12b4f-31fa-42ac-bc64-b7120db0b701",
              "type": "SELECT",
              "name": "key",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": "'INDEX'",
              "options": [
                {
                  "id": "3d25ba30-07dc-40a3-8dba-6abddaf34f48",
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
              "id": "77cc1de3-e6d2-4f40-a8fb-294d82357361",
              "type": "TEXT",
              "name": "icon",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "1b8392db-291f-4b1c-b6ea-3117bd675d89",
              "type": "TEXT",
              "name": "kanbanFieldMetadataId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "4ed9b885-b900-4fb1-842a-81a954dc70f6",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "aa98f3fa-8ce4-4d45-9257-700a00cfbc8c",
              "type": "BOOLEAN",
              "name": "isCompact",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "f147badb-513a-4bf1-9474-798f14086d4a",
              "type": "SELECT",
              "name": "openRecordIn",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": "'SIDE_PANEL'",
              "options": [
                {
                  "id": "ae4caacf-3237-4b2c-a381-bd0e94bde149",
                  "color": "green",
                  "label": "Side Panel",
                  "value": "SIDE_PANEL",
                  "position": 0
                },
                {
                  "id": "19e1835b-bba8-4c14-87e2-37effa9703d3",
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
              "id": "75392b5a-5471-4133-a290-cce1cb3fe025",
              "type": "SELECT",
              "name": "kanbanAggregateOperation",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": "'COUNT'",
              "options": [
                {
                  "id": "fb152180-d3e2-42a6-82a3-8d6d1964f57a",
                  "color": "red",
                  "label": "Average",
                  "value": "AVG",
                  "position": 0
                },
                {
                  "id": "b386c993-bdbf-4b78-866b-f1bf925cf22b",
                  "color": "purple",
                  "label": "Count",
                  "value": "COUNT",
                  "position": 1
                },
                {
                  "id": "94af6ae3-0955-40de-a01b-d3a668563248",
                  "color": "sky",
                  "label": "Maximum",
                  "value": "MAX",
                  "position": 2
                },
                {
                  "id": "81c6b0ed-90b4-4da4-8357-cfe40d1d2645",
                  "color": "turquoise",
                  "label": "Minimum",
                  "value": "MIN",
                  "position": 3
                },
                {
                  "id": "9c17efbb-9a40-4917-bc1b-794fbcf18045",
                  "color": "yellow",
                  "label": "Sum",
                  "value": "SUM",
                  "position": 4
                },
                {
                  "id": "5f0ead42-68cb-4f09-8db5-dc00c8c15a7d",
                  "color": "red",
                  "label": "Count empty",
                  "value": "COUNT_EMPTY",
                  "position": 5
                },
                {
                  "id": "f00675a0-c1c2-4769-8cc5-5cf7a3bcf70f",
                  "color": "purple",
                  "label": "Count not empty",
                  "value": "COUNT_NOT_EMPTY",
                  "position": 6
                },
                {
                  "id": "ba2528e8-290c-4b9c-861d-5702852a1c78",
                  "color": "sky",
                  "label": "Count unique values",
                  "value": "COUNT_UNIQUE_VALUES",
                  "position": 7
                },
                {
                  "id": "53018dce-5f24-4d4e-8285-c4c33ec93de4",
                  "color": "turquoise",
                  "label": "Percent empty",
                  "value": "PERCENTAGE_EMPTY",
                  "position": 8
                },
                {
                  "id": "335ffa62-9282-44c7-a541-0cf3f8cf5542",
                  "color": "yellow",
                  "label": "Percent not empty",
                  "value": "PERCENTAGE_NOT_EMPTY",
                  "position": 9
                },
                {
                  "id": "7aa0ed5e-1046-4325-99ad-a1b84958fce8",
                  "color": "red",
                  "label": "Count true",
                  "value": "COUNT_TRUE",
                  "position": 10
                },
                {
                  "id": "5d8519d2-a4be-4041-bb2c-f319a297fe3a",
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
              "id": "e72a82f9-ded3-4b4d-be2b-07777cf38558",
              "type": "UUID",
              "name": "kanbanAggregateOperationFieldMetadataId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "4a9f9d5e-2a77-4f35-b155-d2f65dd57c20",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "cf69bb60-aabf-4e1a-a005-f94865a278ad",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "07686040-b95d-443f-b2b7-0e9150a584c4",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "c4baef4e-18af-46ca-84af-d13372bcc484",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "2262da8a-a08c-4a2e-b28b-e7a471c6309f",
              "type": "RELATION",
              "name": "viewFields",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "c4b95b85-3b53-4b33-94f2-58a2b5abb746",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "45ff61b7-21cd-4c9a-99cc-1a7f63032949",
                  "nameSingular": "viewField",
                  "namePlural": "viewFields"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "2262da8a-a08c-4a2e-b28b-e7a471c6309f",
                  "name": "viewFields"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "fc9bb55d-ad75-4e86-ae17-d9dfe354ef5f",
                  "name": "view"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "57d6b91e-cd37-49a3-8660-24c34b336936",
              "type": "RELATION",
              "name": "viewGroups",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "c4b95b85-3b53-4b33-94f2-58a2b5abb746",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "cad90776-17ac-4b9b-a3cd-43a6eb0b4d46",
                  "nameSingular": "viewGroup",
                  "namePlural": "viewGroups"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "57d6b91e-cd37-49a3-8660-24c34b336936",
                  "name": "viewGroups"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "9376e026-5d61-4577-92f9-e02700bdda68",
                  "name": "view"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "22aae767-b427-4c0a-8a53-a2e4b82b51cc",
              "type": "RELATION",
              "name": "viewFilters",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "c4b95b85-3b53-4b33-94f2-58a2b5abb746",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "8a9fa581-d75d-495e-8215-cd7c11ea598e",
                  "nameSingular": "viewFilter",
                  "namePlural": "viewFilters"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "22aae767-b427-4c0a-8a53-a2e4b82b51cc",
                  "name": "viewFilters"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "efbea1ad-406e-4f62-9d84-68fdd8b04fba",
                  "name": "view"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "668c57be-d876-4bbe-bf09-5c86d979c919",
              "type": "RELATION",
              "name": "viewFilterGroups",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "c4b95b85-3b53-4b33-94f2-58a2b5abb746",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "d7802b9b-71f5-4ae9-9d52-6d1aca373a2b",
                  "nameSingular": "viewFilterGroup",
                  "namePlural": "viewFilterGroups"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "668c57be-d876-4bbe-bf09-5c86d979c919",
                  "name": "viewFilterGroups"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "7a74a91b-5e05-4449-9595-dfd634d133b6",
                  "name": "view"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "6e9728f2-081b-4552-9084-ff0abc1703c6",
              "type": "RELATION",
              "name": "viewSorts",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "c4b95b85-3b53-4b33-94f2-58a2b5abb746",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "0cb72a53-6506-415c-921c-2268680636ca",
                  "nameSingular": "viewSort",
                  "namePlural": "viewSorts"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "6e9728f2-081b-4552-9084-ff0abc1703c6",
                  "name": "viewSorts"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "ceaeb81a-b576-4c1e-b374-384e80ebbf9c",
                  "name": "view"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "e6d5fcd9-21dc-4b16-965e-a6285622c029",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "c4b95b85-3b53-4b33-94f2-58a2b5abb746",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "e6d5fcd9-21dc-4b16-965e-a6285622c029",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "3b5634cd-c68f-490c-a2d1-0ee148a6bb1f",
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
          "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
          "nameSingular": "favorite",
          "namePlural": "favorites",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "216837d2-ba42-44a8-9889-fb3bfb74bf3e",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Favorite",
          "labelPlural": "Favorites",
          "description": "A favorite that can be accessed from the left menu",
          "icon": "IconHeart",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "e26f55ba-d3a0-464a-898d-ef716cb434d9",
              "type": "NUMBER",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "216837d2-ba42-44a8-9889-fb3bfb74bf3e",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "88096cc7-49e1-4d00-a410-52cb790bf39f",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "e1e969c5-efa0-4afe-9e1f-873ac082b3f6",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "e93e5888-3d8d-43aa-a001-e76a908a85b3",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "0c94cad0-e994-4185-a8c6-3a63e7a2c4d4",
              "type": "RELATION",
              "name": "note",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "46d270fd-7b29-4a75-9943-27c8594b1f3c",
                  "nameSingular": "note",
                  "namePlural": "notes"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "0c94cad0-e994-4185-a8c6-3a63e7a2c4d4",
                  "name": "note"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "cbd1eab7-4628-45ed-b24b-7bddc0aa1b56",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "3b5634cd-c68f-490c-a2d1-0ee148a6bb1f",
              "type": "RELATION",
              "name": "view",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "c4b95b85-3b53-4b33-94f2-58a2b5abb746",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "3b5634cd-c68f-490c-a2d1-0ee148a6bb1f",
                  "name": "view"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "e6d5fcd9-21dc-4b16-965e-a6285622c029",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "4e7814ac-54b9-41ea-8a27-ee18bf7351ea",
              "type": "RELATION",
              "name": "forWorkspaceMember",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "369081b1-70a6-4fc6-9e50-f0b12841549d",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "4e7814ac-54b9-41ea-8a27-ee18bf7351ea",
                  "name": "forWorkspaceMember"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "8fff8dc5-d29c-430a-89bd-1021bfc2ee1e",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "d62f0e47-1e2d-4bea-9ab8-cb4ed52a4367",
              "type": "RELATION",
              "name": "person",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "6f3b9df6-57c0-4fe0-b8af-1a5ed20d76bd",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "d62f0e47-1e2d-4bea-9ab8-cb4ed52a4367",
                  "name": "person"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "377720cb-dae6-408d-a15e-811ec1fc0b23",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "39056ced-b973-41a7-8a1c-41d4381378bb",
              "type": "RELATION",
              "name": "company",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4a45f524-b8cb-40e8-8450-28e402b442cf",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "39056ced-b973-41a7-8a1c-41d4381378bb",
                  "name": "company"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "d81f0aca-6291-419b-8ecf-feae125832d4",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "53867dda-3fe2-48e3-868f-6ccf04ac1a38",
              "type": "RELATION",
              "name": "favoriteFolder",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "ab9c539f-e084-4766-97c7-28fd85116001",
                  "nameSingular": "favoriteFolder",
                  "namePlural": "favoriteFolders"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "53867dda-3fe2-48e3-868f-6ccf04ac1a38",
                  "name": "favoriteFolder"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "1f3b1fef-037e-4399-9809-0b9807658ce1",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "11032cbd-6d29-499d-90c0-e7b5992b26e3",
              "type": "RELATION",
              "name": "opportunity",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "641f0c5f-bb3d-4a8f-8a35-45f769027d41",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "11032cbd-6d29-499d-90c0-e7b5992b26e3",
                  "name": "opportunity"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "95426ef2-2a54-4364-82d5-74f6b8201087",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "cb37eb2d-89ff-4fe9-82d1-4d9151feba13",
              "type": "RELATION",
              "name": "workflow",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "3d041dc9-e4f0-4cd0-ad45-7d15080c4ac7",
                  "nameSingular": "workflow",
                  "namePlural": "workflows"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "cb37eb2d-89ff-4fe9-82d1-4d9151feba13",
                  "name": "workflow"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "35e3b029-4f79-40f2-8a91-ec3344563ea2",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "d0afae27-97ec-4a1e-bcd3-01713fd77828",
              "type": "RELATION",
              "name": "workflowVersion",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4534bb30-62fb-46fd-899b-c03348acd97a",
                  "nameSingular": "workflowVersion",
                  "namePlural": "workflowVersions"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "d0afae27-97ec-4a1e-bcd3-01713fd77828",
                  "name": "workflowVersion"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "c7ea1e1d-651a-4a3b-9645-21239ff1d468",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "abd0bed2-d856-4fb3-8396-2e750d377ff1",
              "type": "RELATION",
              "name": "workflowRun",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "fac890af-68c5-4718-a16b-7401b1868429",
                  "nameSingular": "workflowRun",
                  "namePlural": "workflowRuns"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "abd0bed2-d856-4fb3-8396-2e750d377ff1",
                  "name": "workflowRun"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "79f05bdb-1efb-4079-ab9d-a0d38fca8448",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "e0f63ba2-a19a-4eff-b9f1-f1aff9eb057e",
              "type": "RELATION",
              "name": "task",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "83b1dd88-82e5-4d8c-b52b-81e5302adf58",
                  "nameSingular": "task",
                  "namePlural": "tasks"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "e0f63ba2-a19a-4eff-b9f1-f1aff9eb057e",
                  "name": "task"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "b9edc0a8-9412-4454-a2b0-5129d94a2f28",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "00de8998-a745-405e-9254-4f08005d9f66",
              "type": "RELATION",
              "name": "rocket",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:50.887Z",
              "updatedAt": "2025-06-09T18:53:50.887Z",
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
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "c73c0408-222b-4214-a855-f6bb88ee8ebc",
                  "nameSingular": "rocket",
                  "namePlural": "rockets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "00de8998-a745-405e-9254-4f08005d9f66",
                  "name": "rocket"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "b0df6dca-c0cd-4b7e-9f20-9dd31544fdb0",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "4d2c41a4-caea-4a3c-bdf3-42f2c89c6882",
              "type": "RELATION",
              "name": "pet",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.337Z",
              "updatedAt": "2025-06-09T18:53:51.337Z",
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
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "62855e83-6d97-4c48-bffc-c17e8e955820",
                  "nameSingular": "pet",
                  "namePlural": "pets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "4d2c41a4-caea-4a3c-bdf3-42f2c89c6882",
                  "name": "pet"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "fbf13575-7e51-4546-865d-0cc8cdcc1875",
                  "name": "favorites"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "b129cd82-41f3-43ca-a527-6365a0cf7090",
              "type": "RELATION",
              "name": "surveyResult",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.520Z",
              "updatedAt": "2025-06-09T18:53:52.520Z",
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
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "e58c0a80-38c6-4d18-85b6-7d1e2ad52443",
                  "nameSingular": "surveyResult",
                  "namePlural": "surveyResults"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "b129cd82-41f3-43ca-a527-6365a0cf7090",
                  "name": "surveyResult"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "8163eab2-3a22-4d63-9b7a-e233ae51f995",
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
          "id": "ab9c539f-e084-4766-97c7-28fd85116001",
          "nameSingular": "favoriteFolder",
          "namePlural": "favoriteFolders",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "299a6546-47f3-4966-86ac-980e2d3afaa6",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Favorite Folder",
          "labelPlural": "Favorite Folders",
          "description": "A Folder of favorites",
          "icon": "IconFolder",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "b33279ff-c0cc-4208-8bbd-e5ebe99035a3",
              "type": "NUMBER",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "7f042d41-58d9-49eb-a0af-7c91b83ee038",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "299a6546-47f3-4966-86ac-980e2d3afaa6",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "dd928a4c-9784-4549-83fa-34c8a6b0d017",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "d775c114-5a38-4138-93de-30b815063e2d",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "7d447a83-ac55-4937-bb6d-e6ffebb313dc",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "1f3b1fef-037e-4399-9809-0b9807658ce1",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "ab9c539f-e084-4766-97c7-28fd85116001",
                  "nameSingular": "favoriteFolder",
                  "namePlural": "favoriteFolders"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "1f3b1fef-037e-4399-9809-0b9807658ce1",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "53867dda-3fe2-48e3-868f-6ccf04ac1a38",
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
          "id": "a0a44046-66f1-456a-9133-1f78ac60b9ca",
          "nameSingular": "attachment",
          "namePlural": "attachments",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "7b15c355-4375-4db1-a639-b3162aebad1a",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Attachment",
          "labelPlural": "Attachments",
          "description": "An attachment",
          "icon": "IconFileImport",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "7b15c355-4375-4db1-a639-b3162aebad1a",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "f614be9a-dbbe-42c7-b77b-d0aed3e41bfc",
              "type": "TEXT",
              "name": "fullPath",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "bb1727ac-2393-456a-897b-69a85e3c905f",
              "type": "TEXT",
              "name": "type",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "c4a98c90-74ed-4fbe-a072-35d0d4f9bf98",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "8395ae85-224f-4b88-aa05-d36f113176e4",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "e4f22f2d-7280-42b7-9413-edd3c99b7c05",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "f71da7a1-df41-410c-a8bb-b18684f941fb",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "3f57b6c6-d485-440c-82ad-fb35530a0bf9",
              "type": "RELATION",
              "name": "author",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "a0a44046-66f1-456a-9133-1f78ac60b9ca",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "369081b1-70a6-4fc6-9e50-f0b12841549d",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "3f57b6c6-d485-440c-82ad-fb35530a0bf9",
                  "name": "author"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "78acb16d-7732-4d6f-88f4-8de411f73f14",
                  "name": "authoredAttachments"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "8bca7ad2-050c-4c81-874d-afe2712a3dc5",
              "type": "RELATION",
              "name": "task",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "a0a44046-66f1-456a-9133-1f78ac60b9ca",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "83b1dd88-82e5-4d8c-b52b-81e5302adf58",
                  "nameSingular": "task",
                  "namePlural": "tasks"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "8bca7ad2-050c-4c81-874d-afe2712a3dc5",
                  "name": "task"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "0acbfb8f-e077-4011-9419-e9184e6c4a0e",
                  "name": "attachments"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "9c872831-da9b-494b-9d2e-bf4b0b86a1ea",
              "type": "RELATION",
              "name": "note",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "a0a44046-66f1-456a-9133-1f78ac60b9ca",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "46d270fd-7b29-4a75-9943-27c8594b1f3c",
                  "nameSingular": "note",
                  "namePlural": "notes"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "9c872831-da9b-494b-9d2e-bf4b0b86a1ea",
                  "name": "note"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "ac2e5ed6-900e-46c1-bf1c-8d97516ba626",
                  "name": "attachments"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "4e924062-611f-48e6-a410-695da5a1d1e6",
              "type": "RELATION",
              "name": "person",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "a0a44046-66f1-456a-9133-1f78ac60b9ca",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "6f3b9df6-57c0-4fe0-b8af-1a5ed20d76bd",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "4e924062-611f-48e6-a410-695da5a1d1e6",
                  "name": "person"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "3b7d53c6-b440-4609-919d-782ff4f404e4",
                  "name": "attachments"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "b9307d91-87f5-49f2-9d55-891dbf0ccd06",
              "type": "RELATION",
              "name": "company",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "a0a44046-66f1-456a-9133-1f78ac60b9ca",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4a45f524-b8cb-40e8-8450-28e402b442cf",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "b9307d91-87f5-49f2-9d55-891dbf0ccd06",
                  "name": "company"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "4ea94a98-007a-4631-b0fc-546fb8267d7d",
                  "name": "attachments"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "80ecde59-9d80-4015-b2a7-ba13d0af5d2a",
              "type": "RELATION",
              "name": "opportunity",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "a0a44046-66f1-456a-9133-1f78ac60b9ca",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "641f0c5f-bb3d-4a8f-8a35-45f769027d41",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "80ecde59-9d80-4015-b2a7-ba13d0af5d2a",
                  "name": "opportunity"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "960fe10d-a2b0-4320-9676-79663aab4de2",
                  "name": "attachments"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "a9006098-f8ac-479a-b4c8-e60b50439531",
              "type": "RELATION",
              "name": "rocket",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:50.889Z",
              "updatedAt": "2025-06-09T18:53:50.889Z",
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
                  "id": "a0a44046-66f1-456a-9133-1f78ac60b9ca",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "c73c0408-222b-4214-a855-f6bb88ee8ebc",
                  "nameSingular": "rocket",
                  "namePlural": "rockets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "a9006098-f8ac-479a-b4c8-e60b50439531",
                  "name": "rocket"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "8ce9346a-698f-4870-a931-d4ef20c8fb99",
                  "name": "attachments"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "7924055e-e975-4f45-8854-b60b1b1e5446",
              "type": "RELATION",
              "name": "pet",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.337Z",
              "updatedAt": "2025-06-09T18:53:51.337Z",
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
                  "id": "a0a44046-66f1-456a-9133-1f78ac60b9ca",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "62855e83-6d97-4c48-bffc-c17e8e955820",
                  "nameSingular": "pet",
                  "namePlural": "pets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "7924055e-e975-4f45-8854-b60b1b1e5446",
                  "name": "pet"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "7d562e8f-66eb-4444-b0a7-6028781b83e7",
                  "name": "attachments"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "40f37c0d-99f5-49a4-b57f-18fbeeb07757",
              "type": "RELATION",
              "name": "surveyResult",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.520Z",
              "updatedAt": "2025-06-09T18:53:52.520Z",
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
                  "id": "a0a44046-66f1-456a-9133-1f78ac60b9ca",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "e58c0a80-38c6-4d18-85b6-7d1e2ad52443",
                  "nameSingular": "surveyResult",
                  "namePlural": "surveyResults"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "40f37c0d-99f5-49a4-b57f-18fbeeb07757",
                  "name": "surveyResult"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "8f4633cd-b642-4238-a3e7-76bba59f075c",
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
          "id": "955353b0-fefe-473a-a99e-46b9097ac488",
          "nameSingular": "messageChannelMessageAssociation",
          "namePlural": "messageChannelMessageAssociations",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "857e3ba1-7711-4f0f-87ea-efaba1a67881",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Message Channel Message Association",
          "labelPlural": "Message Channel Message Associations",
          "description": "Message Synced with a Message Channel",
          "icon": "IconMessage",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "ae77eb8c-12e8-4f90-bb2f-0eb9725bb7c6",
              "type": "TEXT",
              "name": "messageExternalId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "95a11ed7-4509-4cca-967a-efff34f52362",
              "type": "TEXT",
              "name": "messageThreadExternalId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "3cf95ffe-4faf-45b9-aec2-5b9ea120d28e",
              "type": "SELECT",
              "name": "direction",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": "'INCOMING'",
              "options": [
                {
                  "id": "7606ebab-4767-413d-8073-4b4043ef405c",
                  "color": "green",
                  "label": "Incoming",
                  "value": "INCOMING",
                  "position": 0
                },
                {
                  "id": "fb291ca3-f8e6-43d1-a680-831880913e2d",
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
              "id": "857e3ba1-7711-4f0f-87ea-efaba1a67881",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "d3eea643-b86e-4117-a5c1-e60faa9f4f9c",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "0712a9c1-290a-4bc4-998c-ccaa017e2013",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "307a5a81-802c-4005-9e33-2d9c5230b227",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "a9adf0e3-ec3d-4521-8da0-07c7e8e9a45b",
              "type": "RELATION",
              "name": "messageChannel",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "955353b0-fefe-473a-a99e-46b9097ac488",
                  "nameSingular": "messageChannelMessageAssociation",
                  "namePlural": "messageChannelMessageAssociations"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "089247da-73c3-456c-a274-eefc605eb3fa",
                  "nameSingular": "messageChannel",
                  "namePlural": "messageChannels"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "a9adf0e3-ec3d-4521-8da0-07c7e8e9a45b",
                  "name": "messageChannel"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "acf71ec0-3fd7-4cb8-b741-b8a9421166a9",
                  "name": "messageChannelMessageAssociations"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "1d10579c-4efa-41ae-b967-54a14a361834",
              "type": "RELATION",
              "name": "message",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "955353b0-fefe-473a-a99e-46b9097ac488",
                  "nameSingular": "messageChannelMessageAssociation",
                  "namePlural": "messageChannelMessageAssociations"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "04dc5940-3a62-4536-ad57-c96f913cf67b",
                  "nameSingular": "message",
                  "namePlural": "messages"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "1d10579c-4efa-41ae-b967-54a14a361834",
                  "name": "message"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "b582f4a6-1e0b-4557-b9f0-d949f51d81f7",
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
          "id": "8a9fa581-d75d-495e-8215-cd7c11ea598e",
          "nameSingular": "viewFilter",
          "namePlural": "viewFilters",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "031a2143-2246-4e12-88b3-f7555a664d94",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "View Filter",
          "labelPlural": "View Filters",
          "description": "(System) View Filters",
          "icon": "IconFilterBolt",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "30b25683-c105-4784-b678-1acfb2f787ec",
              "type": "UUID",
              "name": "fieldMetadataId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "165ed294-5cd0-4685-b202-7917f62f6419",
              "type": "TEXT",
              "name": "operand",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "bff4b29c-6b01-410e-83e5-0affa67fdca0",
              "type": "TEXT",
              "name": "value",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "9e2f9820-ceed-48b6-9a96-d193fb9de668",
              "type": "TEXT",
              "name": "displayValue",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "dee0c4b8-1e24-459e-a427-ad6e87ef4972",
              "type": "UUID",
              "name": "viewFilterGroupId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "2e99bdca-bc2e-4e5b-97ec-a5d2d974b68f",
              "type": "NUMBER",
              "name": "positionInViewFilterGroup",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "c5eb8e3c-d912-4f56-819d-fe7f5cc8eeb9",
              "type": "TEXT",
              "name": "subFieldName",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "031a2143-2246-4e12-88b3-f7555a664d94",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "b27b8eaf-af49-4e6a-88ca-b90235846e37",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "b537e56c-d093-4a13-afbf-931c92f68072",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "8346947f-cae5-451e-816d-7d8d7c9d80b5",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "efbea1ad-406e-4f62-9d84-68fdd8b04fba",
              "type": "RELATION",
              "name": "view",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "8a9fa581-d75d-495e-8215-cd7c11ea598e",
                  "nameSingular": "viewFilter",
                  "namePlural": "viewFilters"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "c4b95b85-3b53-4b33-94f2-58a2b5abb746",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "efbea1ad-406e-4f62-9d84-68fdd8b04fba",
                  "name": "view"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "22aae767-b427-4c0a-8a53-a2e4b82b51cc",
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
          "id": "83b1dd88-82e5-4d8c-b52b-81e5302adf58",
          "nameSingular": "task",
          "namePlural": "tasks",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": false,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "4c378eec-ec8c-49e1-9eb9-ad217b8f7f6a",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": "T",
          "isLabelSyncedWithName": false,
          "isSearchable": true,
          "duplicateCriteria": null,
          "labelSingular": "Task",
          "labelPlural": "Tasks",
          "description": "A task",
          "icon": "IconCheckbox",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "a504eabc-a878-48eb-a5a4-3d8cac6bccc4",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "4c378eec-ec8c-49e1-9eb9-ad217b8f7f6a",
              "type": "TEXT",
              "name": "title",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "9b83c867-18c1-4c25-bd45-2d3a38ebdbb3",
              "type": "RICH_TEXT_V2",
              "name": "bodyV2",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "21a8ca12-470c-41b1-ad6d-d804dfa67519",
              "type": "DATE_TIME",
              "name": "dueAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "6fe0c758-bfa0-4c75-8471-1f7ad28970ca",
              "type": "SELECT",
              "name": "status",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": "'TODO'",
              "options": [
                {
                  "id": "203a7c1e-a3b0-447f-8ba3-dd8d9be3a3e3",
                  "color": "sky",
                  "label": "To do",
                  "value": "TODO",
                  "position": 0
                },
                {
                  "id": "450e92de-84c5-4df2-94a6-3b55c439114f",
                  "color": "purple",
                  "label": "In progress",
                  "value": "IN_PROGRESS",
                  "position": 1
                },
                {
                  "id": "11b72137-3905-44e0-b63e-4b5eb1630103",
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
              "id": "2d75296b-5d39-4fb4-8228-c94447085b0e",
              "type": "ACTOR",
              "name": "createdBy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "27443165-8f25-4018-b1d6-f9f44e17efba",
              "type": "TS_VECTOR",
              "name": "searchVector",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "22007121-7ed0-40e4-8f79-0d845cd511ed",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "0a93249d-6546-4ce6-b6f4-14b9a62b4575",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "d3746719-1644-4812-b41e-d2c930ff3d43",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "f76b5f0f-5a05-48d4-9f5f-83f18180aa79",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "b9edc0a8-9412-4454-a2b0-5129d94a2f28",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "83b1dd88-82e5-4d8c-b52b-81e5302adf58",
                  "nameSingular": "task",
                  "namePlural": "tasks"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "b9edc0a8-9412-4454-a2b0-5129d94a2f28",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "e0f63ba2-a19a-4eff-b9f1-f1aff9eb057e",
                  "name": "task"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "1ee92229-0b16-4e8d-bce4-567d52a50ad5",
              "type": "RELATION",
              "name": "taskTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "83b1dd88-82e5-4d8c-b52b-81e5302adf58",
                  "nameSingular": "task",
                  "namePlural": "tasks"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "7ae7e7ef-6985-4606-bbe3-b76e97b93524",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "1ee92229-0b16-4e8d-bce4-567d52a50ad5",
                  "name": "taskTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "d3d2afcb-3514-4f15-8d62-4c9c999cd38f",
                  "name": "task"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "0acbfb8f-e077-4011-9419-e9184e6c4a0e",
              "type": "RELATION",
              "name": "attachments",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "83b1dd88-82e5-4d8c-b52b-81e5302adf58",
                  "nameSingular": "task",
                  "namePlural": "tasks"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "a0a44046-66f1-456a-9133-1f78ac60b9ca",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "0acbfb8f-e077-4011-9419-e9184e6c4a0e",
                  "name": "attachments"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "8bca7ad2-050c-4c81-874d-afe2712a3dc5",
                  "name": "task"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "86dc3cad-1833-4a29-80f2-cb8a4c1e5394",
              "type": "RELATION",
              "name": "assignee",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "83b1dd88-82e5-4d8c-b52b-81e5302adf58",
                  "nameSingular": "task",
                  "namePlural": "tasks"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "369081b1-70a6-4fc6-9e50-f0b12841549d",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "86dc3cad-1833-4a29-80f2-cb8a4c1e5394",
                  "name": "assignee"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "1d00b961-1c91-4e35-af43-dfc67fd9a6cf",
                  "name": "assignedTasks"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "6c0e54d4-0ae2-4aba-9bbb-fa176bb60add",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "83b1dd88-82e5-4d8c-b52b-81e5302adf58",
                  "nameSingular": "task",
                  "namePlural": "tasks"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "6c0e54d4-0ae2-4aba-9bbb-fa176bb60add",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "b13e5081-f064-4be1-bfe5-48f5e1ed2d62",
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
          "id": "7ae7e7ef-6985-4606-bbe3-b76e97b93524",
          "nameSingular": "taskTarget",
          "namePlural": "taskTargets",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "33e3ed71-cf2f-4790-bb11-cf3dd96fa822",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Task Target",
          "labelPlural": "Task Targets",
          "description": "A task target",
          "icon": "IconCheckbox",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "33e3ed71-cf2f-4790-bb11-cf3dd96fa822",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "8da619d3-79d3-4560-9337-12ead382635f",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "bdb63d57-1f12-43aa-8f5d-d0d3fd521ec2",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "9fe99aa6-e1be-4b1c-b4d0-86db85a81e92",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "d3d2afcb-3514-4f15-8d62-4c9c999cd38f",
              "type": "RELATION",
              "name": "task",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "7ae7e7ef-6985-4606-bbe3-b76e97b93524",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "83b1dd88-82e5-4d8c-b52b-81e5302adf58",
                  "nameSingular": "task",
                  "namePlural": "tasks"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "d3d2afcb-3514-4f15-8d62-4c9c999cd38f",
                  "name": "task"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "1ee92229-0b16-4e8d-bce4-567d52a50ad5",
                  "name": "taskTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "6857a9be-9d00-45a9-91dc-0a1e55463db4",
              "type": "RELATION",
              "name": "person",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "7ae7e7ef-6985-4606-bbe3-b76e97b93524",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "6f3b9df6-57c0-4fe0-b8af-1a5ed20d76bd",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "6857a9be-9d00-45a9-91dc-0a1e55463db4",
                  "name": "person"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "ddcd104b-4b9b-46ee-8dd5-0a5d1d0de809",
                  "name": "taskTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "78adb2b7-69f2-4a94-9fb0-4d06a44b4418",
              "type": "RELATION",
              "name": "company",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "7ae7e7ef-6985-4606-bbe3-b76e97b93524",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4a45f524-b8cb-40e8-8450-28e402b442cf",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "78adb2b7-69f2-4a94-9fb0-4d06a44b4418",
                  "name": "company"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "e2e49a83-15d5-4d8b-8597-d8aa3f197876",
                  "name": "taskTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "5c606215-8084-4096-8dc1-b7928e4bd15a",
              "type": "RELATION",
              "name": "opportunity",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "7ae7e7ef-6985-4606-bbe3-b76e97b93524",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "641f0c5f-bb3d-4a8f-8a35-45f769027d41",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "5c606215-8084-4096-8dc1-b7928e4bd15a",
                  "name": "opportunity"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "6227ad06-c41f-42e4-9052-badf25e7f654",
                  "name": "taskTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "98348674-2701-4300-83fc-26d26e8928cc",
              "type": "RELATION",
              "name": "rocket",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:50.890Z",
              "updatedAt": "2025-06-09T18:53:50.890Z",
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
                  "id": "7ae7e7ef-6985-4606-bbe3-b76e97b93524",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "c73c0408-222b-4214-a855-f6bb88ee8ebc",
                  "nameSingular": "rocket",
                  "namePlural": "rockets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "98348674-2701-4300-83fc-26d26e8928cc",
                  "name": "rocket"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "a858d85a-f3b4-47ff-a82c-e2dd4f106155",
                  "name": "taskTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "41435fe0-cc28-4385-9d4c-dc637817dfb4",
              "type": "RELATION",
              "name": "pet",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.338Z",
              "updatedAt": "2025-06-09T18:53:51.338Z",
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
                  "id": "7ae7e7ef-6985-4606-bbe3-b76e97b93524",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "62855e83-6d97-4c48-bffc-c17e8e955820",
                  "nameSingular": "pet",
                  "namePlural": "pets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "41435fe0-cc28-4385-9d4c-dc637817dfb4",
                  "name": "pet"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "c5be53cd-fbf9-4977-88f7-bfab9c588ecc",
                  "name": "taskTargets"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "393c9bb2-b10a-4fd6-a7a7-88095e7c648f",
              "type": "RELATION",
              "name": "surveyResult",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:52.521Z",
              "updatedAt": "2025-06-09T18:53:52.521Z",
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
                  "id": "7ae7e7ef-6985-4606-bbe3-b76e97b93524",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "e58c0a80-38c6-4d18-85b6-7d1e2ad52443",
                  "nameSingular": "surveyResult",
                  "namePlural": "surveyResults"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "393c9bb2-b10a-4fd6-a7a7-88095e7c648f",
                  "name": "surveyResult"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "ea4ca74a-498e-4af8-91b1-e6d9e1f85c4c",
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
          "id": "7ad6021f-d432-4c92-baef-2b632196a62a",
          "nameSingular": "calendarEvent",
          "namePlural": "calendarEvents",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "fe67b947-69c7-4d2b-b98c-e2d497be567b",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Calendar event",
          "labelPlural": "Calendar events",
          "description": "Calendar events",
          "icon": "IconCalendar",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "fe67b947-69c7-4d2b-b98c-e2d497be567b",
              "type": "TEXT",
              "name": "title",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "44a11bbd-6c74-4ce1-a037-fb5f3a5c1aa7",
              "type": "BOOLEAN",
              "name": "isCanceled",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "86bf2c57-31b4-4222-97af-4efb195c6435",
              "type": "BOOLEAN",
              "name": "isFullDay",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "85de6f75-4d18-410b-840d-fedf5753df66",
              "type": "DATE_TIME",
              "name": "startsAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "3283518a-b400-4897-8415-a5f82bfe80dc",
              "type": "DATE_TIME",
              "name": "endsAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "5cb07da2-a573-422a-8490-4037f886c468",
              "type": "DATE_TIME",
              "name": "externalCreatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "829b509d-a7c3-42b2-93c0-fc321219ef77",
              "type": "DATE_TIME",
              "name": "externalUpdatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "aebdadf8-477f-43cc-9aaf-46b5d214a11e",
              "type": "TEXT",
              "name": "description",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "590bce34-1866-40a4-b0d0-ec932008dd3a",
              "type": "TEXT",
              "name": "location",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "21f219f9-c531-4ab5-9640-69230baa83d0",
              "type": "TEXT",
              "name": "iCalUid",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "3018608d-47a8-42bc-8dce-7c78be76207e",
              "type": "TEXT",
              "name": "conferenceSolution",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "10b3f751-0089-4dbe-a985-8837b8319c37",
              "type": "LINKS",
              "name": "conferenceLink",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "738fbb9d-c1f2-4474-9f56-c8551da3fd34",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "e21a6ea6-4024-434e-bece-7e05defd2527",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "a10787f7-345c-4b6e-af1b-8be40f461a68",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "9f33912c-5fc6-4842-a384-a2413f476ef4",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "f5e2b471-0a15-4329-9483-80f859cbb048",
              "type": "RELATION",
              "name": "calendarChannelEventAssociations",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "7ad6021f-d432-4c92-baef-2b632196a62a",
                  "nameSingular": "calendarEvent",
                  "namePlural": "calendarEvents"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "0afdc892-41cb-4869-98fd-0623162dbdf4",
                  "nameSingular": "calendarChannelEventAssociation",
                  "namePlural": "calendarChannelEventAssociations"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "f5e2b471-0a15-4329-9483-80f859cbb048",
                  "name": "calendarChannelEventAssociations"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "3d2f517a-6a76-4c29-8d5d-84c6361bebaa",
                  "name": "calendarEvent"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "f60bc6d4-7b0a-4955-a728-1b7ef8ea844e",
              "type": "RELATION",
              "name": "calendarEventParticipants",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "7ad6021f-d432-4c92-baef-2b632196a62a",
                  "nameSingular": "calendarEvent",
                  "namePlural": "calendarEvents"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "3dd1c5bd-c964-414d-a52f-c3d182f9eac7",
                  "nameSingular": "calendarEventParticipant",
                  "namePlural": "calendarEventParticipants"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "f60bc6d4-7b0a-4955-a728-1b7ef8ea844e",
                  "name": "calendarEventParticipants"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "3178f466-488b-4e80-8129-7ad753974ce2",
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
          "id": "736f6327-d230-4daa-b198-55fdaec9de8e",
          "nameSingular": "blocklist",
          "namePlural": "blocklists",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "a381b5f6-e2fd-46e0-aee1-8783a7ca90c4",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Blocklist",
          "labelPlural": "Blocklists",
          "description": "Blocklist",
          "icon": "IconForbid2",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "a381b5f6-e2fd-46e0-aee1-8783a7ca90c4",
              "type": "TEXT",
              "name": "handle",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "d6c53a8d-f16f-4a96-8877-29d3c4069091",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "73f10d8a-0b65-4913-acff-e310fb88eb2b",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "2382a201-ffba-46cb-a7f2-67346cfb0166",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "704a7cf9-9e4e-4563-9da6-0616a973b142",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "00ed9836-c76d-4dbc-9ea1-a892611a5705",
              "type": "RELATION",
              "name": "workspaceMember",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "736f6327-d230-4daa-b198-55fdaec9de8e",
                  "nameSingular": "blocklist",
                  "namePlural": "blocklists"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "369081b1-70a6-4fc6-9e50-f0b12841549d",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "00ed9836-c76d-4dbc-9ea1-a892611a5705",
                  "name": "workspaceMember"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "9f5669c4-6a99-4b59-ad01-97570cb4b464",
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
          "id": "6f3b9df6-57c0-4fe0-b8af-1a5ed20d76bd",
          "nameSingular": "person",
          "namePlural": "people",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": false,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "8d2741b1-0afa-4478-bdc0-146617c512b3",
          "imageIdentifierFieldMetadataId": "c81edc28-2c83-49ee-90ee-d7a6881ae558",
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
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "8d2741b1-0afa-4478-bdc0-146617c512b3",
              "type": "FULL_NAME",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "d49dcd4e-9565-4a11-99ac-c6e278fc028b",
              "type": "EMAILS",
              "name": "emails",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": true,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "5d90f2e5-93ba-49a8-879a-ae206a0c363f",
              "type": "LINKS",
              "name": "linkedinLink",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "e2392cea-ac36-4422-8a88-25e3587160f3",
              "type": "LINKS",
              "name": "xLink",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "90d5dcc4-e946-4b4c-ad72-091c42113c63",
              "type": "TEXT",
              "name": "jobTitle",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "aea4d3da-9643-4ad3-948e-58b06624982f",
              "type": "PHONES",
              "name": "phones",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "001000cd-3682-47b1-9491-e8051f878548",
              "type": "TEXT",
              "name": "city",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "c81edc28-2c83-49ee-90ee-d7a6881ae558",
              "type": "TEXT",
              "name": "avatarUrl",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "b8d8a495-1dc1-4b81-83b9-17eb0a1e4eb5",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "bbd977ff-ef87-414c-a56b-8d01f5f02615",
              "type": "ACTOR",
              "name": "createdBy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "28abc54f-5d86-4d54-8e65-5b44b9249153",
              "type": "TS_VECTOR",
              "name": "searchVector",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "911a30a0-eed2-489f-ae4b-d4e15663d405",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "a7e3eb33-90d3-4190-88db-2b3ff596ed7a",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "4b3429c2-0e97-4bd4-a688-061403f20234",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "a1be011d-ea4f-4812-8b89-72c2ccb8d756",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "e82262eb-7f58-4167-a23c-fc51ec584d1b",
              "type": "RELATION",
              "name": "company",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "6f3b9df6-57c0-4fe0-b8af-1a5ed20d76bd",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4a45f524-b8cb-40e8-8450-28e402b442cf",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "e82262eb-7f58-4167-a23c-fc51ec584d1b",
                  "name": "company"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "3c211c59-02a1-4904-ad0f-5bb30b736461",
                  "name": "people"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "2a255737-3465-40be-8776-01dd9e25eb69",
              "type": "RELATION",
              "name": "pointOfContactForOpportunities",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "6f3b9df6-57c0-4fe0-b8af-1a5ed20d76bd",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "641f0c5f-bb3d-4a8f-8a35-45f769027d41",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "2a255737-3465-40be-8776-01dd9e25eb69",
                  "name": "pointOfContactForOpportunities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "bba7ecb3-72e9-41e7-b1b7-89a3c60b37ad",
                  "name": "pointOfContact"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "ddcd104b-4b9b-46ee-8dd5-0a5d1d0de809",
              "type": "RELATION",
              "name": "taskTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "6f3b9df6-57c0-4fe0-b8af-1a5ed20d76bd",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "7ae7e7ef-6985-4606-bbe3-b76e97b93524",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "ddcd104b-4b9b-46ee-8dd5-0a5d1d0de809",
                  "name": "taskTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "6857a9be-9d00-45a9-91dc-0a1e55463db4",
                  "name": "person"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "1d36023f-cfae-491e-bf86-a4768d97b100",
              "type": "RELATION",
              "name": "noteTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "6f3b9df6-57c0-4fe0-b8af-1a5ed20d76bd",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "f8022881-1190-4760-8107-309648f32024",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "1d36023f-cfae-491e-bf86-a4768d97b100",
                  "name": "noteTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "94c251a4-a8b9-4f84-812b-4b68297ea465",
                  "name": "person"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "377720cb-dae6-408d-a15e-811ec1fc0b23",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "6f3b9df6-57c0-4fe0-b8af-1a5ed20d76bd",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "377720cb-dae6-408d-a15e-811ec1fc0b23",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "d62f0e47-1e2d-4bea-9ab8-cb4ed52a4367",
                  "name": "person"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "3b7d53c6-b440-4609-919d-782ff4f404e4",
              "type": "RELATION",
              "name": "attachments",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "6f3b9df6-57c0-4fe0-b8af-1a5ed20d76bd",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "a0a44046-66f1-456a-9133-1f78ac60b9ca",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "3b7d53c6-b440-4609-919d-782ff4f404e4",
                  "name": "attachments"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "4e924062-611f-48e6-a410-695da5a1d1e6",
                  "name": "person"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "7b26a561-1bc3-4a50-a340-3b0f21d28e47",
              "type": "RELATION",
              "name": "messageParticipants",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "6f3b9df6-57c0-4fe0-b8af-1a5ed20d76bd",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "c5bdd9b9-06c5-450a-86b7-cb91f3c33b94",
                  "nameSingular": "messageParticipant",
                  "namePlural": "messageParticipants"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "7b26a561-1bc3-4a50-a340-3b0f21d28e47",
                  "name": "messageParticipants"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "fe4bd25a-5bfb-4c3b-8947-af44cca0009a",
                  "name": "person"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "4ff49456-5079-4474-88fe-4d5414807f93",
              "type": "RELATION",
              "name": "calendarEventParticipants",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "6f3b9df6-57c0-4fe0-b8af-1a5ed20d76bd",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "3dd1c5bd-c964-414d-a52f-c3d182f9eac7",
                  "nameSingular": "calendarEventParticipant",
                  "namePlural": "calendarEventParticipants"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "4ff49456-5079-4474-88fe-4d5414807f93",
                  "name": "calendarEventParticipants"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "d12110d9-ce8a-48fb-a82c-5d93dce9e003",
                  "name": "person"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "a0c65226-6ea1-4324-8abf-a2a91a9a6c75",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "6f3b9df6-57c0-4fe0-b8af-1a5ed20d76bd",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "a0c65226-6ea1-4324-8abf-a2a91a9a6c75",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "3e88da0b-1d84-43d3-b75e-8e7b55ef423c",
                  "name": "person"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "991baedf-c3a2-44af-a35d-b4fc3da4fb28",
              "type": "TEXT",
              "name": "intro",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:53.490Z",
              "updatedAt": "2025-06-09T18:53:53.490Z",
              "defaultValue": "''",
              "options": null,
              "settings": {},
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Intro",
              "description": "",
              "icon": "IconNote"
            },
            {
              "__typename": "Field",
              "id": "6b86002b-b245-4f7b-9f08-6385a2df2fc7",
              "type": "PHONES",
              "name": "whatsapp",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:53.492Z",
              "updatedAt": "2025-06-09T18:53:53.492Z",
              "defaultValue": {
                "additionalPhones": null,
                "primaryPhoneNumber": "''",
                "primaryPhoneCallingCode": "'+33'",
                "primaryPhoneCountryCode": "'FR'"
              },
              "options": null,
              "settings": {},
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Whatsapp",
              "description": "",
              "icon": "IconBrandWhatsapp"
            },
            {
              "__typename": "Field",
              "id": "90025973-789e-4df7-96f7-7840d182a7d2",
              "type": "MULTI_SELECT",
              "name": "workPreference",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:53.493Z",
              "updatedAt": "2025-06-09T18:53:53.493Z",
              "defaultValue": null,
              "options": [
                {
                  "id": "799da6bb-0c2c-4833-acc7-2e751ae2d8a9",
                  "color": "green",
                  "label": "On-Site",
                  "value": "ON_SITE",
                  "position": 0
                },
                {
                  "id": "d80f9ed7-6366-4080-9a60-dfbb65e05307",
                  "color": "turquoise",
                  "label": "Hybrid",
                  "value": "HYBRID",
                  "position": 1
                },
                {
                  "id": "ec54505e-c078-47c2-86e0-ab657bc3707c",
                  "color": "sky",
                  "label": "Remote Work",
                  "value": "REMOTE_WORK",
                  "position": 2
                }
              ],
              "settings": {},
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Work Preference",
              "description": "",
              "icon": "IconHome"
            },
            {
              "__typename": "Field",
              "id": "d1a2f93b-80d1-41db-b4c3-9fc67001d8a5",
              "type": "RATING",
              "name": "performanceRating",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:53.494Z",
              "updatedAt": "2025-06-09T18:53:53.494Z",
              "defaultValue": null,
              "options": [
                {
                  "id": "9a07c19a-d202-4b58-80db-7ca84993af3c",
                  "label": "1",
                  "value": "RATING_1",
                  "position": 0
                },
                {
                  "id": "b7acf78a-1912-4746-b110-9960eec6ffe3",
                  "label": "2",
                  "value": "RATING_2",
                  "position": 1
                },
                {
                  "id": "14f1ca12-ef40-47ed-acd1-8a6d34eeadf4",
                  "label": "3",
                  "value": "RATING_3",
                  "position": 2
                },
                {
                  "id": "83e040a3-dd17-42d1-a636-f798deb5fb91",
                  "label": "4",
                  "value": "RATING_4",
                  "position": 3
                },
                {
                  "id": "5e3e8a34-63ce-4380-a1e2-eb27f31427d1",
                  "label": "5",
                  "value": "RATING_5",
                  "position": 4
                }
              ],
              "settings": {},
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Performance Rating",
              "description": "",
              "icon": "IconStars"
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "641f0c5f-bb3d-4a8f-8a35-45f769027d41",
          "nameSingular": "opportunity",
          "namePlural": "opportunities",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": false,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "77a41ed6-0723-4f53-a062-568e87fb961e",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": "O",
          "isLabelSyncedWithName": false,
          "isSearchable": true,
          "duplicateCriteria": null,
          "labelSingular": "Opportunity",
          "labelPlural": "Opportunities",
          "description": "An opportunity",
          "icon": "IconTargetArrow",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "77a41ed6-0723-4f53-a062-568e87fb961e",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "6684e144-0152-49ae-a5d5-b1e3363a6586",
              "type": "CURRENCY",
              "name": "amount",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "6b23a6ee-c030-4af5-a47f-7673d9abca0c",
              "type": "DATE_TIME",
              "name": "closeDate",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "77fccf84-50d7-40d0-a097-564ceb3e8433",
              "type": "SELECT",
              "name": "stage",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": "'NEW'",
              "options": [
                {
                  "id": "adc42776-e953-4f90-abee-e64f638b9db4",
                  "color": "red",
                  "label": "New",
                  "value": "NEW",
                  "position": 0
                },
                {
                  "id": "87f355a6-dc1a-4e7d-a249-30693f6a6eb4",
                  "color": "purple",
                  "label": "Screening",
                  "value": "SCREENING",
                  "position": 1
                },
                {
                  "id": "b5f0d84c-e068-489e-a552-e24fb61a456e",
                  "color": "sky",
                  "label": "Meeting",
                  "value": "MEETING",
                  "position": 2
                },
                {
                  "id": "b3846874-aeb1-44a6-bbec-18706381ba4b",
                  "color": "turquoise",
                  "label": "Proposal",
                  "value": "PROPOSAL",
                  "position": 3
                },
                {
                  "id": "1fd6fad1-db91-460c-aab7-a1ed4596f9ba",
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
              "id": "997c6e4c-9d63-4b25-a1a5-0014040e995b",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "c00d2a90-e612-4530-ae5b-11423e50552d",
              "type": "ACTOR",
              "name": "createdBy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "e918212c-7546-4d09-a4f2-b1718976d451",
              "type": "TS_VECTOR",
              "name": "searchVector",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "a863a42c-6cb8-4f4b-b566-a90a82beb023",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "199b36b1-12fd-4baa-98b4-52975352c4c2",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "bcd1e046-78dd-437d-ad0e-96ce33691e5a",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "5398e336-835f-467b-94da-4a8869456dfd",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "bba7ecb3-72e9-41e7-b1b7-89a3c60b37ad",
              "type": "RELATION",
              "name": "pointOfContact",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "641f0c5f-bb3d-4a8f-8a35-45f769027d41",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "6f3b9df6-57c0-4fe0-b8af-1a5ed20d76bd",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "bba7ecb3-72e9-41e7-b1b7-89a3c60b37ad",
                  "name": "pointOfContact"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "2a255737-3465-40be-8776-01dd9e25eb69",
                  "name": "pointOfContactForOpportunities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "47f9b175-1177-4057-9972-0eb3e9e18efe",
              "type": "RELATION",
              "name": "company",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "641f0c5f-bb3d-4a8f-8a35-45f769027d41",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4a45f524-b8cb-40e8-8450-28e402b442cf",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "47f9b175-1177-4057-9972-0eb3e9e18efe",
                  "name": "company"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "0252cd73-3888-4886-8a60-a56663c350e5",
                  "name": "opportunities"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "95426ef2-2a54-4364-82d5-74f6b8201087",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "641f0c5f-bb3d-4a8f-8a35-45f769027d41",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "95426ef2-2a54-4364-82d5-74f6b8201087",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "11032cbd-6d29-499d-90c0-e7b5992b26e3",
                  "name": "opportunity"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "6227ad06-c41f-42e4-9052-badf25e7f654",
              "type": "RELATION",
              "name": "taskTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "641f0c5f-bb3d-4a8f-8a35-45f769027d41",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "7ae7e7ef-6985-4606-bbe3-b76e97b93524",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "6227ad06-c41f-42e4-9052-badf25e7f654",
                  "name": "taskTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "5c606215-8084-4096-8dc1-b7928e4bd15a",
                  "name": "opportunity"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "c7ac121d-f492-4d06-b4ba-264396172dcb",
              "type": "RELATION",
              "name": "noteTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "641f0c5f-bb3d-4a8f-8a35-45f769027d41",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "f8022881-1190-4760-8107-309648f32024",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "c7ac121d-f492-4d06-b4ba-264396172dcb",
                  "name": "noteTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "3db5112b-eb5b-466c-9dca-37a319e05448",
                  "name": "opportunity"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "960fe10d-a2b0-4320-9676-79663aab4de2",
              "type": "RELATION",
              "name": "attachments",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "641f0c5f-bb3d-4a8f-8a35-45f769027d41",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "a0a44046-66f1-456a-9133-1f78ac60b9ca",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "960fe10d-a2b0-4320-9676-79663aab4de2",
                  "name": "attachments"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "80ecde59-9d80-4015-b2a7-ba13d0af5d2a",
                  "name": "opportunity"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "ebc969ed-a08d-4e56-a6df-9d98930faa84",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "641f0c5f-bb3d-4a8f-8a35-45f769027d41",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "ebc969ed-a08d-4e56-a6df-9d98930faa84",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "477a0642-da68-4aff-94a6-f55a4d53337b",
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
          "id": "62855e83-6d97-4c48-bffc-c17e8e955820",
          "nameSingular": "pet",
          "namePlural": "pets",
          "isCustom": true,
          "isRemote": false,
          "isActive": true,
          "isSystem": false,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:51.326Z",
          "updatedAt": "2025-06-09T18:53:51.330Z",
          "labelIdentifierFieldMetadataId": "efd57cdc-99d2-4d4c-8389-be7d3ed9718d",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": true,
          "duplicateCriteria": null,
          "labelSingular": "Pet",
          "labelPlural": "Pets",
          "description": null,
          "icon": "IconCat",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "117f4dd8-71f3-46c3-b0b7-6700aecb8e31",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.326Z",
              "updatedAt": "2025-06-09T18:53:51.326Z",
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
              "id": "efd57cdc-99d2-4d4c-8389-be7d3ed9718d",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.326Z",
              "updatedAt": "2025-06-09T18:53:51.326Z",
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
              "id": "4de011eb-3930-43c7-b105-e44d327b75fa",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.326Z",
              "updatedAt": "2025-06-09T18:53:51.326Z",
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
              "id": "ad157af7-91d5-4018-8177-1c098a46ffae",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.326Z",
              "updatedAt": "2025-06-09T18:53:51.326Z",
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
              "id": "7d2780c9-c399-452c-bda6-7d56147619a5",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.326Z",
              "updatedAt": "2025-06-09T18:53:51.326Z",
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
              "id": "4b0d7e0c-e5d1-433b-9039-8669aa11368f",
              "type": "ACTOR",
              "name": "createdBy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.326Z",
              "updatedAt": "2025-06-09T18:53:51.326Z",
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
              "id": "a347ff60-7536-40e2-96e3-20eb4496cbe7",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.326Z",
              "updatedAt": "2025-06-09T18:53:51.326Z",
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
              "id": "fbf13575-7e51-4546-865d-0cc8cdcc1875",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.337Z",
              "updatedAt": "2025-06-09T18:53:51.337Z",
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
                  "id": "62855e83-6d97-4c48-bffc-c17e8e955820",
                  "nameSingular": "pet",
                  "namePlural": "pets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "fbf13575-7e51-4546-865d-0cc8cdcc1875",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "4d2c41a4-caea-4a3c-bdf3-42f2c89c6882",
                  "name": "pet"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "7d562e8f-66eb-4444-b0a7-6028781b83e7",
              "type": "RELATION",
              "name": "attachments",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.337Z",
              "updatedAt": "2025-06-09T18:53:51.337Z",
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
                  "id": "62855e83-6d97-4c48-bffc-c17e8e955820",
                  "nameSingular": "pet",
                  "namePlural": "pets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "a0a44046-66f1-456a-9133-1f78ac60b9ca",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "7d562e8f-66eb-4444-b0a7-6028781b83e7",
                  "name": "attachments"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "7924055e-e975-4f45-8854-b60b1b1e5446",
                  "name": "pet"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "9b15e22f-72e4-454f-928a-aecbd4b70b4c",
              "type": "RELATION",
              "name": "noteTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.337Z",
              "updatedAt": "2025-06-09T18:53:51.337Z",
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
                  "id": "62855e83-6d97-4c48-bffc-c17e8e955820",
                  "nameSingular": "pet",
                  "namePlural": "pets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "f8022881-1190-4760-8107-309648f32024",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "9b15e22f-72e4-454f-928a-aecbd4b70b4c",
                  "name": "noteTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "302f2a25-0661-4e15-b258-b1a5bdd0446c",
                  "name": "pet"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "6bcc33d7-e4f3-4f24-a24a-903297c99f4a",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.337Z",
              "updatedAt": "2025-06-09T18:53:51.337Z",
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
                  "id": "62855e83-6d97-4c48-bffc-c17e8e955820",
                  "nameSingular": "pet",
                  "namePlural": "pets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "6bcc33d7-e4f3-4f24-a24a-903297c99f4a",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "ccd688fd-77b7-44a6-b723-ef81aba000e2",
                  "name": "pet"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "c5be53cd-fbf9-4977-88f7-bfab9c588ecc",
              "type": "RELATION",
              "name": "taskTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.338Z",
              "updatedAt": "2025-06-09T18:53:51.338Z",
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
                  "id": "62855e83-6d97-4c48-bffc-c17e8e955820",
                  "nameSingular": "pet",
                  "namePlural": "pets"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "7ae7e7ef-6985-4606-bbe3-b76e97b93524",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "c5be53cd-fbf9-4977-88f7-bfab9c588ecc",
                  "name": "taskTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "41435fe0-cc28-4385-9d4c-dc637817dfb4",
                  "name": "pet"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "0306bb8e-b9c2-4ffe-9395-60a053110018",
              "type": "TS_VECTOR",
              "name": "searchVector",
              "isCustom": false,
              "isActive": false,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.348Z",
              "updatedAt": "2025-06-09T18:53:51.348Z",
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
              "id": "6d22f922-c7e8-4483-820c-366253ea1861",
              "type": "SELECT",
              "name": "species",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.796Z",
              "updatedAt": "2025-06-09T18:53:51.796Z",
              "defaultValue": null,
              "options": [
                {
                  "id": "fc37ea83-36e5-4cd8-892d-d0a1b7ddfce0",
                  "color": "blue",
                  "label": "Dog",
                  "value": "DOG",
                  "position": 0
                },
                {
                  "id": "3bfbf1b9-33ea-4050-b293-6eea410910d1",
                  "color": "red",
                  "label": "Cat",
                  "value": "CAT",
                  "position": 1
                },
                {
                  "id": "77b2c75c-08ba-4346-8098-5569e5554d59",
                  "color": "green",
                  "label": "Bird",
                  "value": "BIRD",
                  "position": 2
                },
                {
                  "id": "3bc689ae-235f-40db-a182-2193845e6f5e",
                  "color": "yellow",
                  "label": "Fish",
                  "value": "FISH",
                  "position": 3
                },
                {
                  "id": "a15d9a9e-9f71-4a70-9d65-a28f13511adb",
                  "color": "purple",
                  "label": "Rabbit",
                  "value": "RABBIT",
                  "position": 4
                },
                {
                  "id": "ff5b76da-d969-4c63-88c1-62c82a2703bb",
                  "color": "orange",
                  "label": "Hamster",
                  "value": "HAMSTER",
                  "position": 5
                }
              ],
              "settings": {},
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Species",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "54a4ece9-8f10-4cb2-aa3b-9202595009b8",
              "type": "MULTI_SELECT",
              "name": "traits",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.819Z",
              "updatedAt": "2025-06-09T18:53:51.819Z",
              "defaultValue": null,
              "options": [
                {
                  "id": "aff0d609-575f-4043-bd0c-35607e4740cf",
                  "color": "blue",
                  "label": "Playful",
                  "value": "PLAYFUL",
                  "position": 0
                },
                {
                  "id": "960de5b9-556b-40ed-861d-91c71e259875",
                  "color": "red",
                  "label": "Friendly",
                  "value": "FRIENDLY",
                  "position": 1
                },
                {
                  "id": "4192f166-d5cf-4ba6-80c1-4ef1d3a1e755",
                  "color": "green",
                  "label": "Protective",
                  "value": "PROTECTIVE",
                  "position": 2
                },
                {
                  "id": "c1263892-5466-4873-9886-ab51cd536ae5",
                  "color": "yellow",
                  "label": "Shy",
                  "value": "SHY",
                  "position": 3
                },
                {
                  "id": "25ba8f6c-1c6a-46b1-816d-399edebbfe08",
                  "color": "purple",
                  "label": "Brave",
                  "value": "BRAVE",
                  "position": 4
                },
                {
                  "id": "06c1fa95-c727-4aaa-b6a7-b854f1da6f58",
                  "color": "orange",
                  "label": "Curious",
                  "value": "CURIOUS",
                  "position": 5
                }
              ],
              "settings": {},
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Traits",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "3bc2598e-856e-429b-9ece-39b0e5b53964",
              "type": "TEXT",
              "name": "comments",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.822Z",
              "updatedAt": "2025-06-09T18:53:51.822Z",
              "defaultValue": "''",
              "options": null,
              "settings": {},
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Comments",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "8b4f58b9-969e-42cc-863b-16e6b4c79296",
              "type": "NUMBER",
              "name": "age",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.824Z",
              "updatedAt": "2025-06-09T18:53:51.824Z",
              "defaultValue": null,
              "options": null,
              "settings": {},
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Age",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "876bfd77-e584-49cb-9719-d01b0a2dae7c",
              "type": "ADDRESS",
              "name": "location",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.825Z",
              "updatedAt": "2025-06-09T18:53:51.825Z",
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
              "settings": {},
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Location",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "936a5224-9a52-43c1-bea1-291e2f72d257",
              "type": "PHONES",
              "name": "vetPhone",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.826Z",
              "updatedAt": "2025-06-09T18:53:51.826Z",
              "defaultValue": {
                "additionalPhones": null,
                "primaryPhoneNumber": "''",
                "primaryPhoneCallingCode": "''",
                "primaryPhoneCountryCode": "''"
              },
              "options": null,
              "settings": {},
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Vet phone",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "c20803bc-6a5e-49a1-b332-64dc5ea92ee1",
              "type": "EMAILS",
              "name": "vetEmail",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.827Z",
              "updatedAt": "2025-06-09T18:53:51.827Z",
              "defaultValue": {
                "primaryEmail": "''",
                "additionalEmails": null
              },
              "options": null,
              "settings": {},
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Vet email",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "37dfbabb-19c8-4146-957e-2537d325a21b",
              "type": "DATE",
              "name": "birthday",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.831Z",
              "updatedAt": "2025-06-09T18:53:51.831Z",
              "defaultValue": null,
              "options": null,
              "settings": {},
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Birthday",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "592015d2-5340-4548-a80c-812a49ac27b2",
              "type": "BOOLEAN",
              "name": "isGoodWithKids",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.836Z",
              "updatedAt": "2025-06-09T18:53:51.836Z",
              "defaultValue": null,
              "options": null,
              "settings": {},
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Is good with kids",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "b2c6021c-8d63-437c-80e8-a0f7d88325ce",
              "type": "LINKS",
              "name": "pictures",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.837Z",
              "updatedAt": "2025-06-09T18:53:51.837Z",
              "defaultValue": {
                "primaryLinkUrl": "''",
                "secondaryLinks": "'[]'",
                "primaryLinkLabel": "''"
              },
              "options": null,
              "settings": {},
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Pictures",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "bd1d9e2b-1cd5-4dcd-ab47-1af544c7e93a",
              "type": "CURRENCY",
              "name": "averageCostOfKibblePerMonth",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.838Z",
              "updatedAt": "2025-06-09T18:53:51.838Z",
              "defaultValue": {
                "amountMicros": null,
                "currencyCode": "''"
              },
              "options": null,
              "settings": {},
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Average cost of kibble per month",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "c7e55dc1-dff4-4a57-8c4b-8ceffe99d509",
              "type": "FULL_NAME",
              "name": "makesOwnerThinkOf",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.838Z",
              "updatedAt": "2025-06-09T18:53:51.838Z",
              "defaultValue": {
                "lastName": "''",
                "firstName": "''"
              },
              "options": null,
              "settings": {},
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Makes its owner think of",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "d97baf5e-0a26-4d69-b452-5cb8da2483e9",
              "type": "RATING",
              "name": "soundSwag",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.839Z",
              "updatedAt": "2025-06-09T18:53:51.839Z",
              "defaultValue": null,
              "options": [
                {
                  "id": "427863f8-6e88-47f3-b951-beb13bcc7b09",
                  "label": "1",
                  "value": "RATING_1",
                  "position": 0
                },
                {
                  "id": "e56b6af9-7e09-4129-858e-74dec3010b11",
                  "label": "2",
                  "value": "RATING_2",
                  "position": 1
                },
                {
                  "id": "5e47f4c1-da62-46f2-8875-83fa029361d4",
                  "label": "3",
                  "value": "RATING_3",
                  "position": 2
                },
                {
                  "id": "c380cf36-f169-48b3-81cc-f8c6c9899625",
                  "label": "4",
                  "value": "RATING_4",
                  "position": 3
                },
                {
                  "id": "810f1efd-2fd5-41ec-b732-8a6536a9718b",
                  "label": "5",
                  "value": "RATING_5",
                  "position": 4
                }
              ],
              "settings": {},
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Sound swag (bark style, meow style, etc.)",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "e3f31db5-a3fb-4fdb-b41f-61fdc0089d23",
              "type": "RICH_TEXT",
              "name": "bio",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.841Z",
              "updatedAt": "2025-06-09T18:53:51.841Z",
              "defaultValue": null,
              "options": null,
              "settings": {},
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Bio",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "ad62e2f3-7ff1-466a-a304-fa5842069e0e",
              "type": "ARRAY",
              "name": "interestingFacts",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.841Z",
              "updatedAt": "2025-06-09T18:53:51.841Z",
              "defaultValue": null,
              "options": null,
              "settings": {},
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Interesting facts",
              "description": "",
              "icon": ""
            },
            {
              "__typename": "Field",
              "id": "f671c7b4-533b-4949-b335-e0c6c1fa35f0",
              "type": "RAW_JSON",
              "name": "extraData",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:51.842Z",
              "updatedAt": "2025-06-09T18:53:51.842Z",
              "defaultValue": null,
              "options": null,
              "settings": {},
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
          "id": "4f860d25-b720-4218-9471-28ac7ccb6c22",
          "nameSingular": "workflowAutomatedTrigger",
          "namePlural": "workflowAutomatedTriggers",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "77b3d19e-d170-442a-b98a-80cc5b4e10ea",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "WorkflowAutomatedTrigger",
          "labelPlural": "WorkflowAutomatedTriggers",
          "description": "A workflow automated trigger",
          "icon": "IconSettingsAutomation",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "b9a1999b-6e54-4992-b96e-dd8b5ade2344",
              "type": "SELECT",
              "name": "type",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": null,
              "options": [
                {
                  "id": "7d1be58a-6d1b-4c47-9ce6-1814eef1b5e3",
                  "color": "green",
                  "label": "Database Event",
                  "value": "DATABASE_EVENT",
                  "position": 0
                },
                {
                  "id": "4a0a8b76-2d90-4c53-936d-6439aa22dee0",
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
              "id": "9639db10-9bf9-429c-a3fb-860cc9f308cd",
              "type": "RAW_JSON",
              "name": "settings",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "77b3d19e-d170-442a-b98a-80cc5b4e10ea",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "d4d8fd54-4da7-4414-9819-5de6e1de156d",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "733dbede-bc1b-4245-b1ff-9708234feae3",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "538101df-99eb-4dac-a4a9-da41c0c62450",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "3c47e048-729a-4e05-b6a6-bd5bb8c5891e",
              "type": "RELATION",
              "name": "workflow",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "4f860d25-b720-4218-9471-28ac7ccb6c22",
                  "nameSingular": "workflowAutomatedTrigger",
                  "namePlural": "workflowAutomatedTriggers"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "3d041dc9-e4f0-4cd0-ad45-7d15080c4ac7",
                  "nameSingular": "workflow",
                  "namePlural": "workflows"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "3c47e048-729a-4e05-b6a6-bd5bb8c5891e",
                  "name": "workflow"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "15ad98cc-832a-4683-becf-987f6866ceeb",
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
          "id": "4a45f524-b8cb-40e8-8450-28e402b442cf",
          "nameSingular": "company",
          "namePlural": "companies",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": false,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "e65d6c53-5bc1-41a4-90c1-dfbf72b87b69",
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
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "e65d6c53-5bc1-41a4-90c1-dfbf72b87b69",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "a710c97a-565d-4868-be27-fa846be32021",
              "type": "LINKS",
              "name": "domainName",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": true,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "1fd0fe7e-97ac-4eb2-a85f-2acee3d360b0",
              "type": "NUMBER",
              "name": "employees",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "7a8a52a6-f837-4f1d-9755-93b14104ec58",
              "type": "LINKS",
              "name": "linkedinLink",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "0ab7f91c-7205-4841-a23f-31952bb8404d",
              "type": "LINKS",
              "name": "xLink",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "bc4caa6b-0e0f-4834-bc96-9c7cb92fa932",
              "type": "CURRENCY",
              "name": "annualRecurringRevenue",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "d948c198-14ef-4707-800d-a03e5c2bdd11",
              "type": "ADDRESS",
              "name": "address",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "86e2ba34-6dfa-4f9e-87f9-2b5f09a183a2",
              "type": "BOOLEAN",
              "name": "idealCustomerProfile",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "b435bc4e-21e6-43b8-a411-46c23c2de2bf",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "e6db1e64-3ffb-47c8-8943-5ef20186d3e2",
              "type": "ACTOR",
              "name": "createdBy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "d69d9ca9-df3f-400b-87c0-ef09fa250f0c",
              "type": "TS_VECTOR",
              "name": "searchVector",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "f464d407-0370-4bd3-ae9f-ed5b6c330288",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "204d67dd-1578-4a8d-9d9d-b7dafa0760e4",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "ef76bbc6-cef1-41f5-b9c8-4974f2973efa",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "6da354b1-152e-4ce6-87a7-018c2fe03255",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "3c211c59-02a1-4904-ad0f-5bb30b736461",
              "type": "RELATION",
              "name": "people",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "4a45f524-b8cb-40e8-8450-28e402b442cf",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "6f3b9df6-57c0-4fe0-b8af-1a5ed20d76bd",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "3c211c59-02a1-4904-ad0f-5bb30b736461",
                  "name": "people"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "e82262eb-7f58-4167-a23c-fc51ec584d1b",
                  "name": "company"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "6811b55c-5670-42c5-bd3e-72e57f5bb701",
              "type": "RELATION",
              "name": "accountOwner",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "4a45f524-b8cb-40e8-8450-28e402b442cf",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "369081b1-70a6-4fc6-9e50-f0b12841549d",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "6811b55c-5670-42c5-bd3e-72e57f5bb701",
                  "name": "accountOwner"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "4a7eb4da-02ca-4999-a0da-9453c41c787b",
                  "name": "accountOwnerForCompanies"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "e2e49a83-15d5-4d8b-8597-d8aa3f197876",
              "type": "RELATION",
              "name": "taskTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "4a45f524-b8cb-40e8-8450-28e402b442cf",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "7ae7e7ef-6985-4606-bbe3-b76e97b93524",
                  "nameSingular": "taskTarget",
                  "namePlural": "taskTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "e2e49a83-15d5-4d8b-8597-d8aa3f197876",
                  "name": "taskTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "78adb2b7-69f2-4a94-9fb0-4d06a44b4418",
                  "name": "company"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "60d04ca2-1122-4249-9091-547202f1e8d2",
              "type": "RELATION",
              "name": "noteTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "4a45f524-b8cb-40e8-8450-28e402b442cf",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "f8022881-1190-4760-8107-309648f32024",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "60d04ca2-1122-4249-9091-547202f1e8d2",
                  "name": "noteTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "17aa0682-1cd2-4b4d-91f4-70a1aecfd39e",
                  "name": "company"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "0252cd73-3888-4886-8a60-a56663c350e5",
              "type": "RELATION",
              "name": "opportunities",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "4a45f524-b8cb-40e8-8450-28e402b442cf",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "641f0c5f-bb3d-4a8f-8a35-45f769027d41",
                  "nameSingular": "opportunity",
                  "namePlural": "opportunities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "0252cd73-3888-4886-8a60-a56663c350e5",
                  "name": "opportunities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "47f9b175-1177-4057-9972-0eb3e9e18efe",
                  "name": "company"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "d81f0aca-6291-419b-8ecf-feae125832d4",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "4a45f524-b8cb-40e8-8450-28e402b442cf",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "d81f0aca-6291-419b-8ecf-feae125832d4",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "39056ced-b973-41a7-8a1c-41d4381378bb",
                  "name": "company"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "4ea94a98-007a-4631-b0fc-546fb8267d7d",
              "type": "RELATION",
              "name": "attachments",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "4a45f524-b8cb-40e8-8450-28e402b442cf",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "a0a44046-66f1-456a-9133-1f78ac60b9ca",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "4ea94a98-007a-4631-b0fc-546fb8267d7d",
                  "name": "attachments"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "b9307d91-87f5-49f2-9d55-891dbf0ccd06",
                  "name": "company"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "5f5b9615-6773-4dff-9913-c437685a704b",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "4a45f524-b8cb-40e8-8450-28e402b442cf",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "5f5b9615-6773-4dff-9913-c437685a704b",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "873e176a-fc0b-42cb-b4d2-4c11569e4c18",
                  "name": "company"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "f036c1db-e58c-4ba6-871c-8609b97c5ff3",
              "type": "TEXT",
              "name": "tagline",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:53.213Z",
              "updatedAt": "2025-06-09T18:53:53.213Z",
              "defaultValue": "''",
              "options": null,
              "settings": {},
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Tagline",
              "description": "",
              "icon": "IconAdCircle"
            },
            {
              "__typename": "Field",
              "id": "47636569-6843-4b02-b08d-208cbbba8fed",
              "type": "LINKS",
              "name": "introVideo",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:53.215Z",
              "updatedAt": "2025-06-09T18:53:53.215Z",
              "defaultValue": {
                "primaryLinkUrl": "''",
                "secondaryLinks": "'[]'",
                "primaryLinkLabel": "''"
              },
              "options": null,
              "settings": {},
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Intro Video",
              "description": "",
              "icon": "IconVideo"
            },
            {
              "__typename": "Field",
              "id": "c136fc38-7257-4555-ae85-e9bafe91a2c4",
              "type": "MULTI_SELECT",
              "name": "workPolicy",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:53.216Z",
              "updatedAt": "2025-06-09T18:53:53.216Z",
              "defaultValue": null,
              "options": [
                {
                  "id": "71194d51-4af8-4a6b-b296-11119d57bf53",
                  "color": "green",
                  "label": "On-Site",
                  "value": "ON_SITE",
                  "position": 0
                },
                {
                  "id": "243b61a3-fa3d-4d42-ac85-bc42490aa464",
                  "color": "turquoise",
                  "label": "Hybrid",
                  "value": "HYBRID",
                  "position": 1
                },
                {
                  "id": "40305b07-9ab3-48be-91d7-b5a07082d71d",
                  "color": "sky",
                  "label": "Remote Work",
                  "value": "REMOTE_WORK",
                  "position": 2
                }
              ],
              "settings": {},
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Work Policy",
              "description": "",
              "icon": "IconHome"
            },
            {
              "__typename": "Field",
              "id": "40e9556e-e441-4473-b3fa-53c4b723f5d4",
              "type": "BOOLEAN",
              "name": "visaSponsorship",
              "isCustom": true,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:53.218Z",
              "updatedAt": "2025-06-09T18:53:53.218Z",
              "defaultValue": false,
              "options": null,
              "settings": {},
              "isLabelSyncedWithName": false,
              "relation": null,
              "label": "Visa Sponsorship",
              "description": "",
              "icon": "IconBrandVisa"
            }
          ]
        }
      },
      {
        "__typename": "ObjectEdge",
        "node": {
          "__typename": "Object",
          "id": "4895c95d-e723-4fac-9327-943b55ed865c",
          "nameSingular": "connectedAccount",
          "namePlural": "connectedAccounts",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "a5b14907-7ca6-4452-9a1b-8fa76d087f62",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Connected Account",
          "labelPlural": "Connected Accounts",
          "description": "A connected account",
          "icon": "IconAt",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "a5b14907-7ca6-4452-9a1b-8fa76d087f62",
              "type": "TEXT",
              "name": "handle",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "4a76f1de-855a-4946-b33d-1ec145fd9631",
              "type": "TEXT",
              "name": "provider",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "9ded96f0-74b2-454e-b6b0-dc469eb76248",
              "type": "TEXT",
              "name": "accessToken",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "3b55a508-95dc-4d02-aa97-391572f086c1",
              "type": "TEXT",
              "name": "refreshToken",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "234ad9cf-d03d-4bcf-bc30-c14a9fd7a3be",
              "type": "TEXT",
              "name": "lastSyncHistoryId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "5d734d4c-d9d5-4188-b98d-34d9ef8cd173",
              "type": "DATE_TIME",
              "name": "authFailedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "460b669f-7232-40f7-9f1c-ec9b8ce4ecaf",
              "type": "TEXT",
              "name": "handleAliases",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "5be6c9ad-e0f6-4ddf-862d-f8c88c30b221",
              "type": "ARRAY",
              "name": "scopes",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "42673d6a-7cfc-4e20-aeff-d67cc7d1998f",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "d763e364-37df-4ca7-a996-c8a95563c548",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "3f50f352-852e-4fcc-9115-a42a1754f1c2",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "1c5a42fc-ce19-4d6e-b913-a1f457e9ab70",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "0c89f5cf-4232-4df1-8784-4ca9380a0a9b",
              "type": "RELATION",
              "name": "accountOwner",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "4895c95d-e723-4fac-9327-943b55ed865c",
                  "nameSingular": "connectedAccount",
                  "namePlural": "connectedAccounts"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "369081b1-70a6-4fc6-9e50-f0b12841549d",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "0c89f5cf-4232-4df1-8784-4ca9380a0a9b",
                  "name": "accountOwner"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "1f64702f-3611-4113-9bdf-50b289fbf63e",
                  "name": "connectedAccounts"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "afbbcb9f-5ff7-49a2-b9b7-b0ae22050ad2",
              "type": "RELATION",
              "name": "messageChannels",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "4895c95d-e723-4fac-9327-943b55ed865c",
                  "nameSingular": "connectedAccount",
                  "namePlural": "connectedAccounts"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "089247da-73c3-456c-a274-eefc605eb3fa",
                  "nameSingular": "messageChannel",
                  "namePlural": "messageChannels"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "afbbcb9f-5ff7-49a2-b9b7-b0ae22050ad2",
                  "name": "messageChannels"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "7a010ef3-1638-4f65-bcdc-8e6e3e8049e7",
                  "name": "connectedAccount"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "a4443016-e645-4801-94a0-0ec8864f6290",
              "type": "RELATION",
              "name": "calendarChannels",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "4895c95d-e723-4fac-9327-943b55ed865c",
                  "nameSingular": "connectedAccount",
                  "namePlural": "connectedAccounts"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "0972537f-b817-40b1-a34f-a30a270d2b07",
                  "nameSingular": "calendarChannel",
                  "namePlural": "calendarChannels"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "a4443016-e645-4801-94a0-0ec8864f6290",
                  "name": "calendarChannels"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "4e2f119e-8865-4a6a-b1ac-33d821fc260a",
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
          "id": "46d270fd-7b29-4a75-9943-27c8594b1f3c",
          "nameSingular": "note",
          "namePlural": "notes",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": false,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "7b1da965-b3b3-4c08-aa75-1c6147704ffd",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": "N",
          "isLabelSyncedWithName": false,
          "isSearchable": true,
          "duplicateCriteria": null,
          "labelSingular": "Note",
          "labelPlural": "Notes",
          "description": "A note",
          "icon": "IconNotes",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "452b2752-158f-45a0-98e3-c589e114043c",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "8d6003b7-87ea-4f14-94e4-1c045014874e",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "30af23a1-e24f-410a-a022-821b000afe81",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "7b1da965-b3b3-4c08-aa75-1c6147704ffd",
              "type": "TEXT",
              "name": "title",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "b44eecda-a7e8-44ff-8db1-4ce2ca80f34c",
              "type": "RICH_TEXT_V2",
              "name": "bodyV2",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "82baf3f9-ad32-44e9-9b79-61995060ed23",
              "type": "ACTOR",
              "name": "createdBy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "ac77bf26-535c-4c88-8735-97702866de25",
              "type": "TS_VECTOR",
              "name": "searchVector",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "5aac0f27-b242-44db-bf76-d64f014f8540",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "aee477d6-4137-4d89-9f19-ce9f7f37deaa",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "f08cc9b1-eba9-402b-bc0a-f7351fc19361",
              "type": "RELATION",
              "name": "noteTargets",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "46d270fd-7b29-4a75-9943-27c8594b1f3c",
                  "nameSingular": "note",
                  "namePlural": "notes"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "f8022881-1190-4760-8107-309648f32024",
                  "nameSingular": "noteTarget",
                  "namePlural": "noteTargets"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "f08cc9b1-eba9-402b-bc0a-f7351fc19361",
                  "name": "noteTargets"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "0500ed2f-0c98-4524-bc11-1d946ea5162c",
                  "name": "note"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "ac2e5ed6-900e-46c1-bf1c-8d97516ba626",
              "type": "RELATION",
              "name": "attachments",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "46d270fd-7b29-4a75-9943-27c8594b1f3c",
                  "nameSingular": "note",
                  "namePlural": "notes"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "a0a44046-66f1-456a-9133-1f78ac60b9ca",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "ac2e5ed6-900e-46c1-bf1c-8d97516ba626",
                  "name": "attachments"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "9c872831-da9b-494b-9d2e-bf4b0b86a1ea",
                  "name": "note"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "503766e0-f1d2-4702-b6bf-c301a19582fa",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "46d270fd-7b29-4a75-9943-27c8594b1f3c",
                  "nameSingular": "note",
                  "namePlural": "notes"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "503766e0-f1d2-4702-b6bf-c301a19582fa",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "394a9497-491c-49f5-a8a4-d5f74e9003f3",
                  "name": "note"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "cbd1eab7-4628-45ed-b24b-7bddc0aa1b56",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "46d270fd-7b29-4a75-9943-27c8594b1f3c",
                  "nameSingular": "note",
                  "namePlural": "notes"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "cbd1eab7-4628-45ed-b24b-7bddc0aa1b56",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "0c94cad0-e994-4185-a8c6-3a63e7a2c4d4",
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
          "id": "45ff61b7-21cd-4c9a-99cc-1a7f63032949",
          "nameSingular": "viewField",
          "namePlural": "viewFields",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "a6ccb8df-d31d-4340-ab8c-02308701ae1c",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "View Field",
          "labelPlural": "View Fields",
          "description": "(System) View Fields",
          "icon": "IconTag",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "e66ef23b-9f73-4336-b245-299f265431bb",
              "type": "UUID",
              "name": "fieldMetadataId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "3fafd64f-e7e7-438e-ae79-dd0267f290ab",
              "type": "BOOLEAN",
              "name": "isVisible",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "0cdf1896-52af-4a4f-af2c-10aad7447f4b",
              "type": "NUMBER",
              "name": "size",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "e6ef7240-f8b7-4264-99c7-64a89a2be2c2",
              "type": "NUMBER",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "6a695836-f368-4a0d-9c7a-ccd340b1a808",
              "type": "SELECT",
              "name": "aggregateOperation",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": null,
              "options": [
                {
                  "id": "76c6acee-4f8b-4367-a08d-feaf003b997e",
                  "color": "red",
                  "label": "Average",
                  "value": "AVG",
                  "position": 0
                },
                {
                  "id": "48a842e1-5bd8-475f-9681-3b4c62891933",
                  "color": "purple",
                  "label": "Count",
                  "value": "COUNT",
                  "position": 1
                },
                {
                  "id": "1878e811-3d76-41f5-ba35-7d58146f1451",
                  "color": "sky",
                  "label": "Maximum",
                  "value": "MAX",
                  "position": 2
                },
                {
                  "id": "413cb8c1-6cfa-47ab-86da-f51d054622dc",
                  "color": "turquoise",
                  "label": "Minimum",
                  "value": "MIN",
                  "position": 3
                },
                {
                  "id": "ede73fd8-9d9b-4d3f-a475-3cdfdcdc63c0",
                  "color": "yellow",
                  "label": "Sum",
                  "value": "SUM",
                  "position": 4
                },
                {
                  "id": "ddc7bcc7-5d48-4eb8-8660-e053b16f8845",
                  "color": "red",
                  "label": "Count empty",
                  "value": "COUNT_EMPTY",
                  "position": 5
                },
                {
                  "id": "52c17387-bc62-455e-8604-b12e70ec223b",
                  "color": "purple",
                  "label": "Count not empty",
                  "value": "COUNT_NOT_EMPTY",
                  "position": 6
                },
                {
                  "id": "5f255a84-79ce-49ab-8d44-d324f841ca5a",
                  "color": "sky",
                  "label": "Count unique values",
                  "value": "COUNT_UNIQUE_VALUES",
                  "position": 7
                },
                {
                  "id": "60a53249-6043-449a-85b4-c319e67ee7a4",
                  "color": "turquoise",
                  "label": "Percent empty",
                  "value": "PERCENTAGE_EMPTY",
                  "position": 8
                },
                {
                  "id": "6ebadd29-2156-42ab-8d47-243011e591fe",
                  "color": "yellow",
                  "label": "Percent not empty",
                  "value": "PERCENTAGE_NOT_EMPTY",
                  "position": 9
                },
                {
                  "id": "b62cb7a9-2775-4cd4-939f-5f9444cd4f91",
                  "color": "red",
                  "label": "Count true",
                  "value": "COUNT_TRUE",
                  "position": 10
                },
                {
                  "id": "af150faa-e6a5-49b2-8fdf-fe078da76a31",
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
              "id": "a6ccb8df-d31d-4340-ab8c-02308701ae1c",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "59c54287-ec0d-438d-a45b-332c6b42185e",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "22297a50-78e3-465c-aebd-3fbf8500b070",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "e54d99e3-4bd9-40af-b5cb-f25c3c7405f6",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "fc9bb55d-ad75-4e86-ae17-d9dfe354ef5f",
              "type": "RELATION",
              "name": "view",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "45ff61b7-21cd-4c9a-99cc-1a7f63032949",
                  "nameSingular": "viewField",
                  "namePlural": "viewFields"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "c4b95b85-3b53-4b33-94f2-58a2b5abb746",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "fc9bb55d-ad75-4e86-ae17-d9dfe354ef5f",
                  "name": "view"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "2262da8a-a08c-4a2e-b28b-e7a471c6309f",
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
          "id": "4534bb30-62fb-46fd-899b-c03348acd97a",
          "nameSingular": "workflowVersion",
          "namePlural": "workflowVersions",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": false,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "b79c052a-0957-4abb-98ab-dbb708e63b39",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Workflow Version",
          "labelPlural": "Workflow Versions",
          "description": "A workflow version",
          "icon": "IconVersions",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "b79c052a-0957-4abb-98ab-dbb708e63b39",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "d361fe91-6374-4d76-9e52-e268e024b512",
              "type": "RAW_JSON",
              "name": "trigger",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "958b3578-e664-4915-8e18-637342bf9043",
              "type": "RAW_JSON",
              "name": "steps",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "97abc9ad-0c75-4aa5-9d88-50d0c3a977fd",
              "type": "SELECT",
              "name": "status",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": "'DRAFT'",
              "options": [
                {
                  "id": "3204a532-b01e-4f25-a32b-bc0ca1944f6f",
                  "color": "yellow",
                  "label": "Draft",
                  "value": "DRAFT",
                  "position": 0
                },
                {
                  "id": "985a04f7-6a17-42f1-bbe6-c7498fe85000",
                  "color": "green",
                  "label": "Active",
                  "value": "ACTIVE",
                  "position": 1
                },
                {
                  "id": "3c3ca642-c1bb-4c3b-959a-0029c2088b7a",
                  "color": "orange",
                  "label": "Deactivated",
                  "value": "DEACTIVATED",
                  "position": 2
                },
                {
                  "id": "de9dc9eb-6ab7-447e-b621-500d18866827",
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
              "id": "6bb9d3ff-2980-458e-85dd-5ccf52a89c72",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "ea3fe359-fba1-49a7-84ef-d447622dcfff",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "71afaeb6-096f-4162-abe8-9540f8cc586a",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "cd407b71-6b81-4a98-8120-d9b553b9330f",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "3d25578b-de4a-4d52-ab09-663b6f27a9be",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "e275efb7-512f-4df0-a6c5-7b48e5fa1b64",
              "type": "RELATION",
              "name": "workflow",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "4534bb30-62fb-46fd-899b-c03348acd97a",
                  "nameSingular": "workflowVersion",
                  "namePlural": "workflowVersions"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "3d041dc9-e4f0-4cd0-ad45-7d15080c4ac7",
                  "nameSingular": "workflow",
                  "namePlural": "workflows"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "e275efb7-512f-4df0-a6c5-7b48e5fa1b64",
                  "name": "workflow"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "cfadb60b-7c05-441a-a592-c956a102386f",
                  "name": "versions"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "b960652a-142e-4772-9011-f261e66e59fe",
              "type": "RELATION",
              "name": "runs",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "4534bb30-62fb-46fd-899b-c03348acd97a",
                  "nameSingular": "workflowVersion",
                  "namePlural": "workflowVersions"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "fac890af-68c5-4718-a16b-7401b1868429",
                  "nameSingular": "workflowRun",
                  "namePlural": "workflowRuns"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "b960652a-142e-4772-9011-f261e66e59fe",
                  "name": "runs"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "f26aee9e-883a-46d2-938b-8db3061ba579",
                  "name": "workflowVersion"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "c7ea1e1d-651a-4a3b-9645-21239ff1d468",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "4534bb30-62fb-46fd-899b-c03348acd97a",
                  "nameSingular": "workflowVersion",
                  "namePlural": "workflowVersions"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "c7ea1e1d-651a-4a3b-9645-21239ff1d468",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "d0afae27-97ec-4a1e-bcd3-01713fd77828",
                  "name": "workflowVersion"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "440f9262-bd36-42f3-b90d-b79632b4790c",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "4534bb30-62fb-46fd-899b-c03348acd97a",
                  "nameSingular": "workflowVersion",
                  "namePlural": "workflowVersions"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "440f9262-bd36-42f3-b90d-b79632b4790c",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "57c2fbe0-ec1d-49c9-ba4e-c7c024a8f400",
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
          "id": "3dd1c5bd-c964-414d-a52f-c3d182f9eac7",
          "nameSingular": "calendarEventParticipant",
          "namePlural": "calendarEventParticipants",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "deb66502-6542-48b7-8b9b-e94928ea87c3",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Calendar event participant",
          "labelPlural": "Calendar event participants",
          "description": "Calendar event participants",
          "icon": "IconCalendar",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "deb66502-6542-48b7-8b9b-e94928ea87c3",
              "type": "TEXT",
              "name": "handle",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "ed03726d-b69d-4f8e-9a69-bff7ce4bf80f",
              "type": "TEXT",
              "name": "displayName",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "919d6b34-a1a7-41a4-9a4c-09667a9b6914",
              "type": "BOOLEAN",
              "name": "isOrganizer",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "a2457fb5-25e5-41b3-912e-cecbd74a5125",
              "type": "SELECT",
              "name": "responseStatus",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": "'NEEDS_ACTION'",
              "options": [
                {
                  "id": "c8e95813-2194-4aac-8887-13bfb67f319d",
                  "color": "orange",
                  "label": "Needs Action",
                  "value": "NEEDS_ACTION",
                  "position": 0
                },
                {
                  "id": "62eb2ffc-f625-4357-8bcd-c75357dfe569",
                  "color": "red",
                  "label": "Declined",
                  "value": "DECLINED",
                  "position": 1
                },
                {
                  "id": "a50eccd1-eed3-4616-9b23-4d0f3b5bddcc",
                  "color": "yellow",
                  "label": "Tentative",
                  "value": "TENTATIVE",
                  "position": 2
                },
                {
                  "id": "50550a1b-2c4e-48bc-9013-6bb6dd8320c6",
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
              "id": "ac6189c3-dc1a-4c9f-b199-870deb0a40f7",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "79cc2f13-3da0-4178-8716-1e2d86425178",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "d29c2394-ed5a-4d34-ae01-e5930b81db60",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "0079d63d-ef98-4c68-bf3e-8bfa0eb8b22c",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "3178f466-488b-4e80-8129-7ad753974ce2",
              "type": "RELATION",
              "name": "calendarEvent",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "3dd1c5bd-c964-414d-a52f-c3d182f9eac7",
                  "nameSingular": "calendarEventParticipant",
                  "namePlural": "calendarEventParticipants"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "7ad6021f-d432-4c92-baef-2b632196a62a",
                  "nameSingular": "calendarEvent",
                  "namePlural": "calendarEvents"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "3178f466-488b-4e80-8129-7ad753974ce2",
                  "name": "calendarEvent"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "f60bc6d4-7b0a-4955-a728-1b7ef8ea844e",
                  "name": "calendarEventParticipants"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "d12110d9-ce8a-48fb-a82c-5d93dce9e003",
              "type": "RELATION",
              "name": "person",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "3dd1c5bd-c964-414d-a52f-c3d182f9eac7",
                  "nameSingular": "calendarEventParticipant",
                  "namePlural": "calendarEventParticipants"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "6f3b9df6-57c0-4fe0-b8af-1a5ed20d76bd",
                  "nameSingular": "person",
                  "namePlural": "people"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "d12110d9-ce8a-48fb-a82c-5d93dce9e003",
                  "name": "person"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "4ff49456-5079-4474-88fe-4d5414807f93",
                  "name": "calendarEventParticipants"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "ae5ec2d6-11ec-477f-9f2e-ec1835807a7c",
              "type": "RELATION",
              "name": "workspaceMember",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "3dd1c5bd-c964-414d-a52f-c3d182f9eac7",
                  "nameSingular": "calendarEventParticipant",
                  "namePlural": "calendarEventParticipants"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "369081b1-70a6-4fc6-9e50-f0b12841549d",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "ae5ec2d6-11ec-477f-9f2e-ec1835807a7c",
                  "name": "workspaceMember"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "e53738a2-8080-4299-b8eb-3d2b85abda1b",
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
          "id": "3d041dc9-e4f0-4cd0-ad45-7d15080c4ac7",
          "nameSingular": "workflow",
          "namePlural": "workflows",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": false,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "f0a45b6e-522e-4eb5-9602-a0d43114956a",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": "W",
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Workflow",
          "labelPlural": "Workflows",
          "description": "A workflow",
          "icon": "IconSettingsAutomation",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "f0a45b6e-522e-4eb5-9602-a0d43114956a",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "00139658-d336-4d9a-951f-2c967a98bfcd",
              "type": "TEXT",
              "name": "lastPublishedVersionId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "a7abe2d2-b89f-422c-9d51-0b7cec88ba5d",
              "type": "MULTI_SELECT",
              "name": "statuses",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "7001059a-125c-46a5-843e-429fbc4218e8",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "ffb259c3-1f06-42ec-9083-ba4fa42d85da",
              "type": "ACTOR",
              "name": "createdBy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "9220fe29-91de-482e-a238-2d17c025b5f1",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "86a18c6b-b051-4329-9343-7b7aad8475f4",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "b3b8cba0-6506-4a0a-a9bf-4efe360bda1c",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "ff839fe2-1cdf-45e8-9820-98bd7574aebc",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "cfadb60b-7c05-441a-a592-c956a102386f",
              "type": "RELATION",
              "name": "versions",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "3d041dc9-e4f0-4cd0-ad45-7d15080c4ac7",
                  "nameSingular": "workflow",
                  "namePlural": "workflows"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4534bb30-62fb-46fd-899b-c03348acd97a",
                  "nameSingular": "workflowVersion",
                  "namePlural": "workflowVersions"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "cfadb60b-7c05-441a-a592-c956a102386f",
                  "name": "versions"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "e275efb7-512f-4df0-a6c5-7b48e5fa1b64",
                  "name": "workflow"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "4608fc82-1fcf-46f4-bc14-86bfbbe0f47d",
              "type": "RELATION",
              "name": "runs",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "3d041dc9-e4f0-4cd0-ad45-7d15080c4ac7",
                  "nameSingular": "workflow",
                  "namePlural": "workflows"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "fac890af-68c5-4718-a16b-7401b1868429",
                  "nameSingular": "workflowRun",
                  "namePlural": "workflowRuns"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "4608fc82-1fcf-46f4-bc14-86bfbbe0f47d",
                  "name": "runs"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "1a7584bc-5f3a-466c-ad24-587eda39b8f3",
                  "name": "workflow"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "15ad98cc-832a-4683-becf-987f6866ceeb",
              "type": "RELATION",
              "name": "automatedTriggers",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "3d041dc9-e4f0-4cd0-ad45-7d15080c4ac7",
                  "nameSingular": "workflow",
                  "namePlural": "workflows"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4f860d25-b720-4218-9471-28ac7ccb6c22",
                  "nameSingular": "workflowAutomatedTrigger",
                  "namePlural": "workflowAutomatedTriggers"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "15ad98cc-832a-4683-becf-987f6866ceeb",
                  "name": "automatedTriggers"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "3c47e048-729a-4e05-b6a6-bd5bb8c5891e",
                  "name": "workflow"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "35e3b029-4f79-40f2-8a91-ec3344563ea2",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "3d041dc9-e4f0-4cd0-ad45-7d15080c4ac7",
                  "nameSingular": "workflow",
                  "namePlural": "workflows"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "35e3b029-4f79-40f2-8a91-ec3344563ea2",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "cb37eb2d-89ff-4fe9-82d1-4d9151feba13",
                  "name": "workflow"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "1bedb47b-1bdd-4d01-bd99-6382b707f5a3",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "3d041dc9-e4f0-4cd0-ad45-7d15080c4ac7",
                  "nameSingular": "workflow",
                  "namePlural": "workflows"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "1bedb47b-1bdd-4d01-bd99-6382b707f5a3",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "e79188eb-d3a0-4c26-aeab-c37f4b675966",
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
          "id": "369081b1-70a6-4fc6-9e50-f0b12841549d",
          "nameSingular": "workspaceMember",
          "namePlural": "workspaceMembers",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "d149e3a5-66e0-4190-bc31-6561572b0596",
          "imageIdentifierFieldMetadataId": "a52e2d15-884e-456c-aaaf-b6009379b1d7",
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": true,
          "duplicateCriteria": null,
          "labelSingular": "Workspace Member",
          "labelPlural": "Workspace Members",
          "description": "A workspace member",
          "icon": "IconUserCircle",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "e4dc15e7-b907-41b1-8d92-010d3133258b",
              "type": "POSITION",
              "name": "position",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "d149e3a5-66e0-4190-bc31-6561572b0596",
              "type": "FULL_NAME",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "fd2df7d2-fc1e-4a87-b0c7-f42f0e7cdb04",
              "type": "TEXT",
              "name": "colorScheme",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "e9325a5f-606a-4b54-ba19-006388fe2b8c",
              "type": "TEXT",
              "name": "locale",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "a52e2d15-884e-456c-aaaf-b6009379b1d7",
              "type": "TEXT",
              "name": "avatarUrl",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "470bde1e-3e7a-49cb-baa7-1bb5f7d78ff2",
              "type": "TEXT",
              "name": "userEmail",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "f6b1c81f-b52e-4628-b125-48e2c9b55f1c",
              "type": "UUID",
              "name": "userId",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "1d2fef39-9107-4752-a93d-1cd6ae9c1bf2",
              "type": "TEXT",
              "name": "timeZone",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "7405d5eb-5c24-4748-bc96-a082f2015ceb",
              "type": "SELECT",
              "name": "dateFormat",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": "'SYSTEM'",
              "options": [
                {
                  "id": "2b18365c-ab36-4585-aecf-9cb73a869a07",
                  "color": "turquoise",
                  "label": "System",
                  "value": "SYSTEM",
                  "position": 0
                },
                {
                  "id": "b4aed88d-2879-4a32-ad01-340b3e70fef0",
                  "color": "red",
                  "label": "Month First",
                  "value": "MONTH_FIRST",
                  "position": 1
                },
                {
                  "id": "e43be730-51d0-416d-a272-ca68ec3fefb4",
                  "color": "purple",
                  "label": "Day First",
                  "value": "DAY_FIRST",
                  "position": 2
                },
                {
                  "id": "d631c00e-c4c9-429c-b8d3-512233e6eb3d",
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
              "id": "5daf7cc0-33ab-4e26-9d20-9256c4c067a1",
              "type": "SELECT",
              "name": "timeFormat",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": "'SYSTEM'",
              "options": [
                {
                  "id": "c8846793-b060-4538-a2c3-26986512fa14",
                  "color": "sky",
                  "label": "System",
                  "value": "SYSTEM",
                  "position": 0
                },
                {
                  "id": "b4c2b1bf-bff1-415f-9565-c2c2922ab5d7",
                  "color": "red",
                  "label": "24HRS",
                  "value": "HOUR_24",
                  "position": 1
                },
                {
                  "id": "180f27b7-41f2-4d87-9418-bb396c1a5d8c",
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
              "id": "7e389f1a-c377-4846-92d9-3e38697ee198",
              "type": "TS_VECTOR",
              "name": "searchVector",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "2319602e-fd02-4293-9279-485433045cb7",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "a793c5cb-485c-4314-bd13-c5d9f9c14c19",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "5ccc0b2b-8d46-471e-9712-db8e35fd74a0",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "78e649ea-0814-4ca4-9061-82fc6736ec17",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "1d00b961-1c91-4e35-af43-dfc67fd9a6cf",
              "type": "RELATION",
              "name": "assignedTasks",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "369081b1-70a6-4fc6-9e50-f0b12841549d",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "83b1dd88-82e5-4d8c-b52b-81e5302adf58",
                  "nameSingular": "task",
                  "namePlural": "tasks"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "1d00b961-1c91-4e35-af43-dfc67fd9a6cf",
                  "name": "assignedTasks"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "86dc3cad-1833-4a29-80f2-cb8a4c1e5394",
                  "name": "assignee"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "8fff8dc5-d29c-430a-89bd-1021bfc2ee1e",
              "type": "RELATION",
              "name": "favorites",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "369081b1-70a6-4fc6-9e50-f0b12841549d",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "b95a4f5d-6fdc-48f9-9598-652960eed462",
                  "nameSingular": "favorite",
                  "namePlural": "favorites"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "8fff8dc5-d29c-430a-89bd-1021bfc2ee1e",
                  "name": "favorites"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "4e7814ac-54b9-41ea-8a27-ee18bf7351ea",
                  "name": "forWorkspaceMember"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "4a7eb4da-02ca-4999-a0da-9453c41c787b",
              "type": "RELATION",
              "name": "accountOwnerForCompanies",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "369081b1-70a6-4fc6-9e50-f0b12841549d",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4a45f524-b8cb-40e8-8450-28e402b442cf",
                  "nameSingular": "company",
                  "namePlural": "companies"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "4a7eb4da-02ca-4999-a0da-9453c41c787b",
                  "name": "accountOwnerForCompanies"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "6811b55c-5670-42c5-bd3e-72e57f5bb701",
                  "name": "accountOwner"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "78acb16d-7732-4d6f-88f4-8de411f73f14",
              "type": "RELATION",
              "name": "authoredAttachments",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "369081b1-70a6-4fc6-9e50-f0b12841549d",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "a0a44046-66f1-456a-9133-1f78ac60b9ca",
                  "nameSingular": "attachment",
                  "namePlural": "attachments"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "78acb16d-7732-4d6f-88f4-8de411f73f14",
                  "name": "authoredAttachments"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "3f57b6c6-d485-440c-82ad-fb35530a0bf9",
                  "name": "author"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "1f64702f-3611-4113-9bdf-50b289fbf63e",
              "type": "RELATION",
              "name": "connectedAccounts",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "369081b1-70a6-4fc6-9e50-f0b12841549d",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4895c95d-e723-4fac-9327-943b55ed865c",
                  "nameSingular": "connectedAccount",
                  "namePlural": "connectedAccounts"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "1f64702f-3611-4113-9bdf-50b289fbf63e",
                  "name": "connectedAccounts"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "0c89f5cf-4232-4df1-8784-4ca9380a0a9b",
                  "name": "accountOwner"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "dc3e5858-3aa6-4d5d-8ff4-af658b6e6df1",
              "type": "RELATION",
              "name": "messageParticipants",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "369081b1-70a6-4fc6-9e50-f0b12841549d",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "c5bdd9b9-06c5-450a-86b7-cb91f3c33b94",
                  "nameSingular": "messageParticipant",
                  "namePlural": "messageParticipants"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "dc3e5858-3aa6-4d5d-8ff4-af658b6e6df1",
                  "name": "messageParticipants"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "1d843eae-0490-4518-aadd-97fda8fa3851",
                  "name": "workspaceMember"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "9f5669c4-6a99-4b59-ad01-97570cb4b464",
              "type": "RELATION",
              "name": "blocklist",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "369081b1-70a6-4fc6-9e50-f0b12841549d",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "736f6327-d230-4daa-b198-55fdaec9de8e",
                  "nameSingular": "blocklist",
                  "namePlural": "blocklists"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "9f5669c4-6a99-4b59-ad01-97570cb4b464",
                  "name": "blocklist"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "00ed9836-c76d-4dbc-9ea1-a892611a5705",
                  "name": "workspaceMember"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "e53738a2-8080-4299-b8eb-3d2b85abda1b",
              "type": "RELATION",
              "name": "calendarEventParticipants",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "369081b1-70a6-4fc6-9e50-f0b12841549d",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "3dd1c5bd-c964-414d-a52f-c3d182f9eac7",
                  "nameSingular": "calendarEventParticipant",
                  "namePlural": "calendarEventParticipants"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "e53738a2-8080-4299-b8eb-3d2b85abda1b",
                  "name": "calendarEventParticipants"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "ae5ec2d6-11ec-477f-9f2e-ec1835807a7c",
                  "name": "workspaceMember"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "bbd2f2ea-e5de-4494-8f14-f3233ff751c0",
              "type": "RELATION",
              "name": "timelineActivities",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "369081b1-70a6-4fc6-9e50-f0b12841549d",
                  "nameSingular": "workspaceMember",
                  "namePlural": "workspaceMembers"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "d4dd18bc-c2b1-4619-bc6a-c80dc355b5a1",
                  "nameSingular": "timelineActivity",
                  "namePlural": "timelineActivities"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "bbd2f2ea-e5de-4494-8f14-f3233ff751c0",
                  "name": "timelineActivities"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "49381568-46d2-472e-b3dd-712a5ecbc91f",
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
          "id": "352992e9-f389-45d0-aac5-a89ebc20ba77",
          "nameSingular": "webhook",
          "namePlural": "webhooks",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "84ee59e8-d09a-4466-a2d1-b552b734fb54",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Webhook",
          "labelPlural": "Webhooks",
          "description": "A webhook",
          "icon": "IconRobot",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "84ee59e8-d09a-4466-a2d1-b552b734fb54",
              "type": "TEXT",
              "name": "targetUrl",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "465e5ee5-e10e-4e5e-824a-8a9ad511afb4",
              "type": "ARRAY",
              "name": "operations",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "8407737f-4725-4d01-b574-81b6529054c6",
              "type": "TEXT",
              "name": "description",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "1f8cdbc3-04fa-4fc0-8ada-300e7f2827a3",
              "type": "TEXT",
              "name": "secret",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "4d2cf511-498b-4eaa-9c51-fc7c1df14533",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "438cd8ec-2ad2-4f08-b552-0590ed8c19ef",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "eafc52e2-3761-4a33-911d-33e713a77e71",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "8b80e813-efb8-4bd5-a389-48935ae88baa",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
          "id": "1551e0e2-8694-41f7-a256-423cd8ea04f2",
          "nameSingular": "messageFolder",
          "namePlural": "messageFolders",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "3c1ca883-cdb3-4c28-ae99-0281af9fa608",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Message Folder",
          "labelPlural": "Message Folders",
          "description": "Folder for Message Channel",
          "icon": "IconFolder",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "77ac4207-92ee-4f56-a280-ec738bdd3454",
              "type": "TEXT",
              "name": "name",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "1e29ac50-8f56-42ce-8856-d598b57f274b",
              "type": "TEXT",
              "name": "syncCursor",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "3c1ca883-cdb3-4c28-ae99-0281af9fa608",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "40663b55-5cc7-4731-b785-9dc589ccb9ee",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "1f1b7031-444c-4795-9669-16fc41fa2c13",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "e2734355-ab9d-4b2c-b352-660f03f518e2",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "42c5e22f-bde2-4b4b-a58e-16b1e83b8f14",
              "type": "RELATION",
              "name": "messageChannel",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "1551e0e2-8694-41f7-a256-423cd8ea04f2",
                  "nameSingular": "messageFolder",
                  "namePlural": "messageFolders"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "089247da-73c3-456c-a274-eefc605eb3fa",
                  "nameSingular": "messageChannel",
                  "namePlural": "messageChannels"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "42c5e22f-bde2-4b4b-a58e-16b1e83b8f14",
                  "name": "messageChannel"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "d2573990-8400-43f6-a8ef-65f5b24e84a8",
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
          "id": "0cb72a53-6506-415c-921c-2268680636ca",
          "nameSingular": "viewSort",
          "namePlural": "viewSorts",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "79a6fb69-4a24-40e3-a296-2bfd2ac7f5b9",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "View Sort",
          "labelPlural": "View Sorts",
          "description": "(System) View Sorts",
          "icon": "IconArrowsSort",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "352156b6-d244-431b-b2d8-37ec2e0d022b",
              "type": "UUID",
              "name": "fieldMetadataId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "9d41acdc-7f82-462f-84c7-bfa790723b14",
              "type": "TEXT",
              "name": "direction",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "79a6fb69-4a24-40e3-a296-2bfd2ac7f5b9",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "4da816ae-33b2-46f6-9e13-255c499fc577",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "4d6f9e5d-d324-436b-bdda-fe4a607076f8",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "f236c540-94ff-41e0-ab6b-10213805f200",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "ceaeb81a-b576-4c1e-b374-384e80ebbf9c",
              "type": "RELATION",
              "name": "view",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "0cb72a53-6506-415c-921c-2268680636ca",
                  "nameSingular": "viewSort",
                  "namePlural": "viewSorts"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "c4b95b85-3b53-4b33-94f2-58a2b5abb746",
                  "nameSingular": "view",
                  "namePlural": "views"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "ceaeb81a-b576-4c1e-b374-384e80ebbf9c",
                  "name": "view"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "6e9728f2-081b-4552-9084-ff0abc1703c6",
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
          "id": "0afdc892-41cb-4869-98fd-0623162dbdf4",
          "nameSingular": "calendarChannelEventAssociation",
          "namePlural": "calendarChannelEventAssociations",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "d311620d-aa17-4a67-9ba7-fb32465cdabe",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Calendar Channel Event Association",
          "labelPlural": "Calendar Channel Event Associations",
          "description": "Calendar Channel Event Associations",
          "icon": "IconCalendar",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "ed3a692e-9c66-41d2-aa4c-2203508ee69d",
              "type": "TEXT",
              "name": "eventExternalId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "98cd7f61-f344-4f5a-856c-d4fa63882fd6",
              "type": "TEXT",
              "name": "recurringEventExternalId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "d311620d-aa17-4a67-9ba7-fb32465cdabe",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "16de6b48-7bbb-4f5e-983c-a0f7596b7da0",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "439178b5-0c19-4270-985f-17f2d4604572",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "37da0dcd-9176-42fa-a8b2-583bcce5c418",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "ee2c6dc8-f744-47c9-803c-9e4abca38401",
              "type": "RELATION",
              "name": "calendarChannel",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "0afdc892-41cb-4869-98fd-0623162dbdf4",
                  "nameSingular": "calendarChannelEventAssociation",
                  "namePlural": "calendarChannelEventAssociations"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "0972537f-b817-40b1-a34f-a30a270d2b07",
                  "nameSingular": "calendarChannel",
                  "namePlural": "calendarChannels"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "ee2c6dc8-f744-47c9-803c-9e4abca38401",
                  "name": "calendarChannel"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "bf0ab3db-1109-4811-86d3-92cf2e13d33f",
                  "name": "calendarChannelEventAssociations"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "3d2f517a-6a76-4c29-8d5d-84c6361bebaa",
              "type": "RELATION",
              "name": "calendarEvent",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "0afdc892-41cb-4869-98fd-0623162dbdf4",
                  "nameSingular": "calendarChannelEventAssociation",
                  "namePlural": "calendarChannelEventAssociations"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "7ad6021f-d432-4c92-baef-2b632196a62a",
                  "nameSingular": "calendarEvent",
                  "namePlural": "calendarEvents"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "3d2f517a-6a76-4c29-8d5d-84c6361bebaa",
                  "name": "calendarEvent"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "f5e2b471-0a15-4329-9483-80f859cbb048",
                  "name": "calendarChannelEventAssociations"
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
          "id": "0972537f-b817-40b1-a34f-a30a270d2b07",
          "nameSingular": "calendarChannel",
          "namePlural": "calendarChannels",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "7fe20fd5-9f22-457f-882b-7ce8082ee379",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Calendar Channel",
          "labelPlural": "Calendar Channels",
          "description": "Calendar Channels",
          "icon": "IconCalendar",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "7fe20fd5-9f22-457f-882b-7ce8082ee379",
              "type": "TEXT",
              "name": "handle",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "769803be-e79b-44c5-b995-85925f1ab362",
              "type": "SELECT",
              "name": "syncStatus",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": null,
              "options": [
                {
                  "id": "ec949e81-bf3a-410d-87cb-6b47ada027f4",
                  "color": "yellow",
                  "label": "Ongoing",
                  "value": "ONGOING",
                  "position": 1
                },
                {
                  "id": "1cd565fc-3536-488a-81e9-175112945dba",
                  "color": "blue",
                  "label": "Not Synced",
                  "value": "NOT_SYNCED",
                  "position": 2
                },
                {
                  "id": "386e179b-cc58-409e-adf6-607d11c00655",
                  "color": "green",
                  "label": "Active",
                  "value": "ACTIVE",
                  "position": 3
                },
                {
                  "id": "642807bc-989d-433c-9e94-f323124120ba",
                  "color": "red",
                  "label": "Failed Insufficient Permissions",
                  "value": "FAILED_INSUFFICIENT_PERMISSIONS",
                  "position": 4
                },
                {
                  "id": "24e8a373-4047-4805-aaaa-2441ac9fa37a",
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
              "id": "07d34265-3ffa-431b-bc02-1c0ff5922976",
              "type": "SELECT",
              "name": "syncStage",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": "'CALENDAR_EVENT_LIST_FETCH_PENDING'",
              "options": [
                {
                  "id": "a63c16e1-fe1e-40ff-9380-118f16b30a16",
                  "color": "blue",
                  "label": "Full calendar event list fetch pending",
                  "value": "CALENDAR_EVENT_LIST_FETCH_PENDING",
                  "position": 0
                },
                {
                  "id": "3f99df3c-f124-491e-a9e5-deb0922f250f",
                  "color": "blue",
                  "label": "Partial calendar event list fetch pending",
                  "value": "FULL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                  "position": 1
                },
                {
                  "id": "c35e4012-bc7d-4d68-bd40-fa0753e9b51a",
                  "color": "orange",
                  "label": "Calendar event list fetch ongoing",
                  "value": "CALENDAR_EVENT_LIST_FETCH_ONGOING",
                  "position": 2
                },
                {
                  "id": "80fbed2c-8a66-4982-8f04-a54f6c39ddf4",
                  "color": "blue",
                  "label": "Calendar events import pending",
                  "value": "CALENDAR_EVENTS_IMPORT_PENDING",
                  "position": 3
                },
                {
                  "id": "91c2f80a-be53-47d3-b056-fffd1ae1d872",
                  "color": "orange",
                  "label": "Calendar events import ongoing",
                  "value": "CALENDAR_EVENTS_IMPORT_ONGOING",
                  "position": 4
                },
                {
                  "id": "d03a32fb-aeb5-4d0e-b844-f06ecf5ee5f6",
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
              "id": "78dd9e97-8eea-4ae4-bc84-8c819cc0674d",
              "type": "SELECT",
              "name": "visibility",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": "'SHARE_EVERYTHING'",
              "options": [
                {
                  "id": "1b274a15-969a-49db-a469-c0fa8601ef00",
                  "color": "green",
                  "label": "Metadata",
                  "value": "METADATA",
                  "position": 0
                },
                {
                  "id": "9464a9c3-ba96-4038-acb3-40db597708c1",
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
              "id": "d15b3543-7b01-4e50-afa9-69992d68d2cf",
              "type": "BOOLEAN",
              "name": "isContactAutoCreationEnabled",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "9f286f33-b8a1-471c-91e9-dfc4f459104d",
              "type": "SELECT",
              "name": "contactAutoCreationPolicy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": "'AS_PARTICIPANT_AND_ORGANIZER'",
              "options": [
                {
                  "id": "2727f47d-983f-442b-90e7-9196cf1c09c8",
                  "color": "green",
                  "label": "As Participant and Organizer",
                  "value": "AS_PARTICIPANT_AND_ORGANIZER",
                  "position": 0
                },
                {
                  "id": "5093ee86-8a9f-4198-bcf5-0f9f06a1fbee",
                  "color": "orange",
                  "label": "As Participant",
                  "value": "AS_PARTICIPANT",
                  "position": 1
                },
                {
                  "id": "4d812c6a-cb6d-46f9-adbc-b96fa63e07ae",
                  "color": "blue",
                  "label": "As Organizer",
                  "value": "AS_ORGANIZER",
                  "position": 2
                },
                {
                  "id": "69ac4607-568d-4a9b-b3b8-0805a9eb2fca",
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
              "id": "d0745e99-10f5-4d39-b542-251166b46a51",
              "type": "BOOLEAN",
              "name": "isSyncEnabled",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "876f4ee8-c349-430a-ba6e-e9c25156be70",
              "type": "TEXT",
              "name": "syncCursor",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "7f0c3b1c-f2ec-4778-970c-f63960c06294",
              "type": "DATE_TIME",
              "name": "syncedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "276edd4f-7d43-44bf-b47d-9d5b30bc3671",
              "type": "DATE_TIME",
              "name": "syncStageStartedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "acee0908-4ce3-435b-bd02-96caf48cb7a6",
              "type": "NUMBER",
              "name": "throttleFailureCount",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "770f8653-38c5-4695-a0df-77c18457e88d",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "f65e4a2e-dcaf-4d4a-95eb-2dffe3ea0342",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "f62f8508-941a-40ba-a17c-5328ba2f244d",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "b8e66439-e505-4cd1-9a98-fca70595ed4c",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "4e2f119e-8865-4a6a-b1ac-33d821fc260a",
              "type": "RELATION",
              "name": "connectedAccount",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "0972537f-b817-40b1-a34f-a30a270d2b07",
                  "nameSingular": "calendarChannel",
                  "namePlural": "calendarChannels"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4895c95d-e723-4fac-9327-943b55ed865c",
                  "nameSingular": "connectedAccount",
                  "namePlural": "connectedAccounts"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "4e2f119e-8865-4a6a-b1ac-33d821fc260a",
                  "name": "connectedAccount"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "a4443016-e645-4801-94a0-0ec8864f6290",
                  "name": "calendarChannels"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "bf0ab3db-1109-4811-86d3-92cf2e13d33f",
              "type": "RELATION",
              "name": "calendarChannelEventAssociations",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "0972537f-b817-40b1-a34f-a30a270d2b07",
                  "nameSingular": "calendarChannel",
                  "namePlural": "calendarChannels"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "0afdc892-41cb-4869-98fd-0623162dbdf4",
                  "nameSingular": "calendarChannelEventAssociation",
                  "namePlural": "calendarChannelEventAssociations"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "bf0ab3db-1109-4811-86d3-92cf2e13d33f",
                  "name": "calendarChannelEventAssociations"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "ee2c6dc8-f744-47c9-803c-9e4abca38401",
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
          "id": "089247da-73c3-456c-a274-eefc605eb3fa",
          "nameSingular": "messageChannel",
          "namePlural": "messageChannels",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "0fa7d940-3972-4a1c-bfb6-4582443c3f78",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Message Channel",
          "labelPlural": "Message Channels",
          "description": "Message Channels",
          "icon": "IconMessage",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "03a3fafd-75ec-4781-b99b-19178e9b0c05",
              "type": "SELECT",
              "name": "visibility",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": "'SHARE_EVERYTHING'",
              "options": [
                {
                  "id": "ec572c96-ed1d-4247-a1c2-e31abfa2dcc5",
                  "color": "green",
                  "label": "Metadata",
                  "value": "METADATA",
                  "position": 0
                },
                {
                  "id": "5d2f9e56-2762-4191-97a1-e20630b70a93",
                  "color": "blue",
                  "label": "Subject",
                  "value": "SUBJECT",
                  "position": 1
                },
                {
                  "id": "cf79b03f-fd68-4121-8fdc-0e5b6b0501cf",
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
              "id": "0fa7d940-3972-4a1c-bfb6-4582443c3f78",
              "type": "TEXT",
              "name": "handle",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "7a2fab67-9ede-4d2c-9e9c-9ed3c6c3e7f8",
              "type": "SELECT",
              "name": "type",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": "'email'",
              "options": [
                {
                  "id": "81b6435e-9e60-41fe-a03b-a296939168db",
                  "color": "green",
                  "label": "Email",
                  "value": "email",
                  "position": 0
                },
                {
                  "id": "3affd1d0-91a9-4b73-93a7-6ef1173c4bb9",
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
              "id": "4ba19b07-312d-4bb9-b429-6fd91f5764e4",
              "type": "BOOLEAN",
              "name": "isContactAutoCreationEnabled",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "a08ff18f-445a-4a94-bdb7-39a0d23ffe8c",
              "type": "SELECT",
              "name": "contactAutoCreationPolicy",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": "'SENT'",
              "options": [
                {
                  "id": "532893cc-b186-4635-83d0-b3862e47b988",
                  "color": "green",
                  "label": "Sent and Received",
                  "value": "SENT_AND_RECEIVED",
                  "position": 0
                },
                {
                  "id": "74f975e6-0a12-4e81-a950-5f0a72a67e83",
                  "color": "blue",
                  "label": "Sent",
                  "value": "SENT",
                  "position": 1
                },
                {
                  "id": "0a60830e-d83a-4783-86e0-512dc68c48c6",
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
              "id": "77cadab6-2187-4fc2-a714-26c1528331cd",
              "type": "BOOLEAN",
              "name": "excludeNonProfessionalEmails",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "81344298-698c-41bf-9e51-6469e8a2d7d2",
              "type": "BOOLEAN",
              "name": "excludeGroupEmails",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "0ec247b9-733c-4641-bbaa-a5b917556dfc",
              "type": "BOOLEAN",
              "name": "isSyncEnabled",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "8240baee-8d6e-4725-bf81-393ea533de0e",
              "type": "TEXT",
              "name": "syncCursor",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "a0d25e24-60ef-4f8c-beb7-c9865a6aa29a",
              "type": "DATE_TIME",
              "name": "syncedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "61e3c3eb-12be-4e3e-9922-158a9c12962e",
              "type": "SELECT",
              "name": "syncStatus",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": null,
              "options": [
                {
                  "id": "32f5610f-eb51-4d07-aafd-34d4a0b5de09",
                  "color": "yellow",
                  "label": "Ongoing",
                  "value": "ONGOING",
                  "position": 1
                },
                {
                  "id": "b2a7bb50-4b9e-4242-bc1a-b1e1dca9d4ea",
                  "color": "blue",
                  "label": "Not Synced",
                  "value": "NOT_SYNCED",
                  "position": 2
                },
                {
                  "id": "4f90ddbb-2dfc-4c1e-a2a6-945b085acfe9",
                  "color": "green",
                  "label": "Active",
                  "value": "ACTIVE",
                  "position": 3
                },
                {
                  "id": "8c24bfff-38ef-493e-885f-3d1888b9d655",
                  "color": "red",
                  "label": "Failed Insufficient Permissions",
                  "value": "FAILED_INSUFFICIENT_PERMISSIONS",
                  "position": 4
                },
                {
                  "id": "1f03c1b8-b82e-4270-96c8-a90ff366339b",
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
              "id": "68daa2e4-3c12-4f53-ac31-e76ec3d9b3c4",
              "type": "SELECT",
              "name": "syncStage",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
              "defaultValue": "'MESSAGE_LIST_FETCH_PENDING'",
              "options": [
                {
                  "id": "60f0c071-4375-4e1c-ac0f-3b6c64cb35b3",
                  "color": "blue",
                  "label": "Messages list fetch pending",
                  "value": "MESSAGE_LIST_FETCH_PENDING",
                  "position": 0
                },
                {
                  "id": "ec623d96-5b17-4a67-8206-d475a76b2f31",
                  "color": "orange",
                  "label": "Messages list fetch ongoing",
                  "value": "MESSAGE_LIST_FETCH_ONGOING",
                  "position": 2
                },
                {
                  "id": "7fae11e3-f20c-4b9d-a3b7-49e388b57195",
                  "color": "blue",
                  "label": "Messages import pending",
                  "value": "MESSAGES_IMPORT_PENDING",
                  "position": 3
                },
                {
                  "id": "0ee74773-5d7b-4eac-9c7f-335f6e589514",
                  "color": "orange",
                  "label": "Messages import ongoing",
                  "value": "MESSAGES_IMPORT_ONGOING",
                  "position": 4
                },
                {
                  "id": "aae33dee-d4a0-458b-8042-9acbee73e846",
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
              "id": "9457a6a4-f36d-46bd-ae5b-b220b8e961a8",
              "type": "DATE_TIME",
              "name": "syncStageStartedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "d2f6a94f-57a4-4251-98fc-e628a996dc99",
              "type": "NUMBER",
              "name": "throttleFailureCount",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "7e403a75-7349-48de-b33c-8bfa7d2394a3",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "cdac4a6f-7dcf-4596-8ea4-01de329cfee0",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "a3f15dca-8219-4a68-a47d-fd53a0865ea2",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "8c66b0e3-9e63-481c-b7c1-46dfd29904b4",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "7a010ef3-1638-4f65-bcdc-8e6e3e8049e7",
              "type": "RELATION",
              "name": "connectedAccount",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "089247da-73c3-456c-a274-eefc605eb3fa",
                  "nameSingular": "messageChannel",
                  "namePlural": "messageChannels"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "4895c95d-e723-4fac-9327-943b55ed865c",
                  "nameSingular": "connectedAccount",
                  "namePlural": "connectedAccounts"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "7a010ef3-1638-4f65-bcdc-8e6e3e8049e7",
                  "name": "connectedAccount"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "afbbcb9f-5ff7-49a2-b9b7-b0ae22050ad2",
                  "name": "messageChannels"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "acf71ec0-3fd7-4cb8-b741-b8a9421166a9",
              "type": "RELATION",
              "name": "messageChannelMessageAssociations",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "089247da-73c3-456c-a274-eefc605eb3fa",
                  "nameSingular": "messageChannel",
                  "namePlural": "messageChannels"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "955353b0-fefe-473a-a99e-46b9097ac488",
                  "nameSingular": "messageChannelMessageAssociation",
                  "namePlural": "messageChannelMessageAssociations"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "acf71ec0-3fd7-4cb8-b741-b8a9421166a9",
                  "name": "messageChannelMessageAssociations"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "a9adf0e3-ec3d-4521-8da0-07c7e8e9a45b",
                  "name": "messageChannel"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "d2573990-8400-43f6-a8ef-65f5b24e84a8",
              "type": "RELATION",
              "name": "messageFolders",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "089247da-73c3-456c-a274-eefc605eb3fa",
                  "nameSingular": "messageChannel",
                  "namePlural": "messageChannels"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "1551e0e2-8694-41f7-a256-423cd8ea04f2",
                  "nameSingular": "messageFolder",
                  "namePlural": "messageFolders"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "d2573990-8400-43f6-a8ef-65f5b24e84a8",
                  "name": "messageFolders"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "42c5e22f-bde2-4b4b-a58e-16b1e83b8f14",
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
          "id": "04dc5940-3a62-4536-ad57-c96f913cf67b",
          "nameSingular": "message",
          "namePlural": "messages",
          "isCustom": false,
          "isRemote": false,
          "isActive": true,
          "isSystem": true,
          "isUIReadOnly": false,
          "createdAt": "2025-06-09T18:53:47.000Z",
          "updatedAt": "2025-06-09T18:53:47.000Z",
          "labelIdentifierFieldMetadataId": "2f6b43d0-140a-4176-bc3c-ccd75685b0e9",
          "imageIdentifierFieldMetadataId": null,
          "shortcut": null,
          "isLabelSyncedWithName": false,
          "isSearchable": false,
          "duplicateCriteria": null,
          "labelSingular": "Message",
          "labelPlural": "Messages",
          "description": "A message sent or received through a messaging channel (email, chat, etc.)",
          "icon": "IconMessage",
          "indexMetadataList": [],
          "fieldsList": [
            {
              "__typename": "Field",
              "id": "d6028970-23e5-47e8-84aa-303230a6c180",
              "type": "TEXT",
              "name": "headerMessageId",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "2f6b43d0-140a-4176-bc3c-ccd75685b0e9",
              "type": "TEXT",
              "name": "subject",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "a677de27-7bba-4265-840e-0765da5ad4ad",
              "type": "TEXT",
              "name": "text",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "94f8137d-c8d8-452e-824b-21c8cca9a823",
              "type": "DATE_TIME",
              "name": "receivedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "b2d880f2-cb7b-4d47-8eac-84b49ae8dcdd",
              "type": "UUID",
              "name": "id",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "c31618ef-e648-41ea-b6bd-0d384e322f17",
              "type": "DATE_TIME",
              "name": "createdAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "7637a88c-a2c7-4ccc-83dc-ada0ac91b716",
              "type": "DATE_TIME",
              "name": "updatedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": false,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "95cf0e4a-68b4-43b6-8198-46523b352ef0",
              "type": "DATE_TIME",
              "name": "deletedAt",
              "isCustom": false,
              "isActive": true,
              "isSystem": false,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
              "id": "f2dc3f17-b0e1-4910-927f-e92f05e42e33",
              "type": "RELATION",
              "name": "messageThread",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "04dc5940-3a62-4536-ad57-c96f913cf67b",
                  "nameSingular": "message",
                  "namePlural": "messages"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "cbe0ae42-a8f4-4166-817b-96e647aae5dd",
                  "nameSingular": "messageThread",
                  "namePlural": "messageThreads"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "f2dc3f17-b0e1-4910-927f-e92f05e42e33",
                  "name": "messageThread"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "a48c2807-443d-41c7-8a37-8f211a6372ba",
                  "name": "messages"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "fa1bcb96-3fce-45be-bff2-f7b1447bb35e",
              "type": "RELATION",
              "name": "messageParticipants",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "04dc5940-3a62-4536-ad57-c96f913cf67b",
                  "nameSingular": "message",
                  "namePlural": "messages"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "c5bdd9b9-06c5-450a-86b7-cb91f3c33b94",
                  "nameSingular": "messageParticipant",
                  "namePlural": "messageParticipants"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "fa1bcb96-3fce-45be-bff2-f7b1447bb35e",
                  "name": "messageParticipants"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "22682985-d10f-4f5f-bf2e-977babfd6b85",
                  "name": "message"
                }
              }
            },
            {
              "__typename": "Field",
              "id": "b582f4a6-1e0b-4557-b9f0-d949f51d81f7",
              "type": "RELATION",
              "name": "messageChannelMessageAssociations",
              "isCustom": false,
              "isActive": true,
              "isSystem": true,
              "isUIReadOnly": false,
              "isNullable": true,
              "isUnique": false,
              "createdAt": "2025-06-09T18:53:47.000Z",
              "updatedAt": "2025-06-09T18:53:47.000Z",
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
                  "id": "04dc5940-3a62-4536-ad57-c96f913cf67b",
                  "nameSingular": "message",
                  "namePlural": "messages"
                },
                "targetObjectMetadata": {
                  "__typename": "Object",
                  "id": "955353b0-fefe-473a-a99e-46b9097ac488",
                  "nameSingular": "messageChannelMessageAssociation",
                  "namePlural": "messageChannelMessageAssociations"
                },
                "sourceFieldMetadata": {
                  "__typename": "Field",
                  "id": "b582f4a6-1e0b-4557-b9f0-d949f51d81f7",
                  "name": "messageChannelMessageAssociations"
                },
                "targetFieldMetadata": {
                  "__typename": "Field",
                  "id": "1d10579c-4efa-41ae-b967-54a14a361834",
                  "name": "message"
                }
              }
            }
          ]
        }
      }
    ]
  }
} as ObjectMetadataItemsQuery;
