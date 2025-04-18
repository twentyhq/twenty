import {
  ObjectMetadataItemsQuery,
} from '~/generated-metadata/graphql';

// This file is not designed to be manually edited.
// It's an extract from the dev seeded environment metadata call
// TODO: automate the generation of this file
// ⚠️ WARNING ⚠️: Be sure to activate the workflow feature flag (IsWorkflowEnabled) before updating that mock.
export const mockedStandardObjectMetadataQueryResult: ObjectMetadataItemsQuery =
{
  objects: {
    __typename: "ObjectConnection",
    pageInfo: {
      __typename: "PageInfo",
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: "YXJyYXljb25uZWN0aW9uOjA=",
      endCursor: "YXJyYXljb25uZWN0aW9uOjM4"
    },
    edges: [
      {
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "e327588e-09dd-445f-b7b3-28b707beb1fe",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "calendarEvent",
          namePlural: "calendarEvents",
          icon: "IconCalendar",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "0171f47e-f1e8-4e28-949e-b0a8e1a17356",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Calendar event",
          labelPlural: "Calendar events",
          description: "Calendar events",
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: []
          },
          fieldsList: [
            {
              __typename: "Field",
              id: "0171f47e-f1e8-4e28-949e-b0a8e1a17356",
              type: "TEXT",
              name: "title",
              icon: "IconH1",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Title",
              description: "Title"
            },
            {
              __typename: "Field",
              id: "fba65ec9-f9d3-4743-952c-e8295b5b0a93",
              type: "BOOLEAN",
              name: "isCanceled",
              icon: "IconCalendarCancel",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: false,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Is canceled",
              description: "Is canceled"
            },
            {
              __typename: "Field",
              id: "8047b613-2dc9-4d77-bccc-8a3f54ba3fd4",
              type: "BOOLEAN",
              name: "isFullDay",
              icon: "IconHours24",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: false,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Is Full Day",
              description: "Is Full Day"
            },
            {
              __typename: "Field",
              id: "13f760e1-dabf-407b-8f3c-15db10fd3d7e",
              type: "DATE_TIME",
              name: "startsAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Start Date",
              description: "Start Date"
            },
            {
              __typename: "Field",
              id: "228034fb-0e0d-4381-9c18-3650f0ac96fa",
              type: "DATE_TIME",
              name: "endsAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "End Date",
              description: "End Date"
            },
            {
              __typename: "Field",
              id: "769a975c-cbe6-4b59-aa62-9177fbe55922",
              type: "DATE_TIME",
              name: "externalCreatedAt",
              icon: "IconCalendarPlus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation DateTime",
              description: "Creation DateTime"
            },
            {
              __typename: "Field",
              id: "15112e9d-a898-42c1-aec3-f4079c295151",
              type: "DATE_TIME",
              name: "externalUpdatedAt",
              icon: "IconCalendarCog",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Update DateTime",
              description: "Update DateTime"
            },
            {
              __typename: "Field",
              id: "726a0b26-d0de-4a78-a73c-60649030effb",
              type: "TEXT",
              name: "description",
              icon: "IconFileDescription",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Description",
              description: "Description"
            },
            {
              __typename: "Field",
              id: "4615cfff-3a80-4708-a3f0-eb1948286feb",
              type: "TEXT",
              name: "location",
              icon: "IconMapPin",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Location",
              description: "Location"
            },
            {
              __typename: "Field",
              id: "b7bba863-08ed-40c6-b829-6e858838639d",
              type: "TEXT",
              name: "iCalUID",
              icon: "IconKey",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "iCal UID",
              description: "iCal UID"
            },
            {
              __typename: "Field",
              id: "390de1f9-77ad-4f48-941e-1c652603ba41",
              type: "TEXT",
              name: "conferenceSolution",
              icon: "IconScreenShare",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Conference Solution",
              description: "Conference Solution"
            },
            {
              __typename: "Field",
              id: "bbd5bb0d-3888-4f76-ae5a-2f458226b6e5",
              type: "LINKS",
              name: "conferenceLink",
              icon: "IconLink",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: {
                primaryLinkUrl: "''",
                secondaryLinks: "'[]'",
                primaryLinkLabel: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Meet Link",
              description: "Meet Link"
            },
            {
              __typename: "Field",
              id: "ade689a0-83af-4098-a203-499e20f9cc23",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "c812437e-8e15-4355-b15b-02cf4c47f9d0",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "5dc5eb5b-fc9d-4bd7-8c8a-6e1a446abe35",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "5c3551c1-d4ff-443b-bbd8-942f3fef0c38",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "6626ca4a-91cc-4483-a9c4-1eefdecf5ea9",
              type: "RELATION",
              name: "calendarChannelEventAssociations",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Calendar Channel Event Associations",
              description: "Calendar Channel Event Associations",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "50eb0856-11b5-4b7f-8f63-a60685e9ff33",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "e327588e-09dd-445f-b7b3-28b707beb1fe",
                  nameSingular: "calendarEvent",
                  namePlural: "calendarEvents"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "6626ca4a-91cc-4483-a9c4-1eefdecf5ea9",
                  name: "calendarChannelEventAssociations"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "aef9c77c-0623-4d60-adb6-1aaa3e07538f",
                  nameSingular: "calendarChannelEventAssociation",
                  namePlural: "calendarChannelEventAssociations"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "34bcd5d2-bd75-49d2-b1f2-c5aa9e377e11",
                  name: "calendarEvent"
                }
              }
            },
            {
              __typename: "Field",
              id: "52d53fb3-1199-42c2-b89a-f1a0de2e8776",
              type: "RELATION",
              name: "calendarEventParticipants",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Event Participants",
              description: "Event Participants",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "8e46a49b-4fab-421f-9dcd-862fd2e53600",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "e327588e-09dd-445f-b7b3-28b707beb1fe",
                  nameSingular: "calendarEvent",
                  namePlural: "calendarEvents"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "52d53fb3-1199-42c2-b89a-f1a0de2e8776",
                  name: "calendarEventParticipants"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "dd054a83-dfee-4231-bbe0-ad690f189196",
                  nameSingular: "calendarEventParticipant",
                  namePlural: "calendarEventParticipants"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "21a3c4e8-39aa-4394-8a6c-6d34009190ef",
                  name: "calendarEvent"
                }
              }
            }
          ]
        }
      },
      {
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "e21f9dfe-5af9-4e02-b7b4-4467240243a7",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "auditLog",
          namePlural: "auditLogs",
          icon: "IconTimelineEvent",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "f8ffb39e-dafb-4b61-b2be-e5b41a548ef0",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Audit Log",
          labelPlural: "Audit Logs",
          description: "An audit log of actions performed in the system",
          fieldsList: [
            {
              __typename: "Field",
              id: "f8ffb39e-dafb-4b61-b2be-e5b41a548ef0",
              type: "TEXT",
              name: "name",
              icon: "IconAbc",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Event name",
              description: "Event name/type"
            },
            {
              __typename: "Field",
              id: "f1a34526-b5fa-4724-b1eb-638316f09161",
              type: "RAW_JSON",
              name: "properties",
              icon: "IconListDetails",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Event details",
              description: "Json value for event details"
            },
            {
              __typename: "Field",
              id: "f73b7058-19e2-41a8-892e-5500dc30d315",
              type: "RAW_JSON",
              name: "context",
              icon: "IconListDetails",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Event context",
              description: "Json object to provide context (user, device, workspace, etc.)"
            },
            {
              __typename: "Field",
              id: "80bf5727-923e-4dd0-a6d1-0dddadfcdebf",
              type: "TEXT",
              name: "objectName",
              icon: "IconAbc",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Object name",
              description: "Object name"
            },
            {
              __typename: "Field",
              id: "100b249d-4ba6-4f53-9adb-fd9c0a3cfdee",
              type: "TEXT",
              name: "objectMetadataId",
              icon: "IconAbc",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Object metadata id",
              description: "Object metadata id"
            },
            {
              __typename: "Field",
              id: "87cd8908-a0ea-4def-87e3-44ee81518d00",
              type: "UUID",
              name: "recordId",
              icon: "IconAbc",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Record id",
              description: "Record id"
            },
            {
              __typename: "Field",
              id: "c54a0bbb-aff3-4526-9de2-9583984f2ecd",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "4617c195-a17c-42f4-8c79-6a7712bfe61e",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "0f78a833-a8fa-4179-b4fb-34e483201e9d",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "c04feb79-0619-4f73-9921-7a4756acfc11",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "d16b41f8-0aea-4f23-baf4-716913a41d52",
              type: "UUID",
              name: "workspaceMemberId",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Workspace Member id (foreign key)",
              description: "Event workspace member id foreign key"
            },
            {
              __typename: "Field",
              id: "6f5a9d78-2e2c-43a3-abe1-c4159784f6fe",
              type: "RELATION",
              name: "workspaceMember",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Workspace Member",
              description: "Event workspace member",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "0aa8e034-da5b-4c62-bcba-625bad969e66",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "e21f9dfe-5af9-4e02-b7b4-4467240243a7",
                  nameSingular: "auditLog",
                  namePlural: "auditLogs"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "6f5a9d78-2e2c-43a3-abe1-c4159784f6fe",
                  name: "workspaceMember"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "c841d49e-6664-4008-80bc-905c5540671e",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "6ab4ce90-581f-425b-bbba-6ce5adc70f25",
                  name: "auditLogs"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "838b558e-3e20-4c55-8a7d-965cb5ae443a",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_ca389a7ad7595bb15d733535998",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "687fdfdd-ca26-4cf4-a501-6e716e0345da",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "c04feb79-0619-4f73-9921-7a4756acfc11"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "bb9b0a98-ac96-47b3-afad-81428f9fa546",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "d16b41f8-0aea-4f23-baf4-716913a41d52"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "e17eb8fc-5ba9-4479-9c76-f731f8584a9a",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "noteTarget",
          namePlural: "noteTargets",
          icon: "IconCheckbox",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "d1d1ff00-7330-4c8d-b9b6-ae9f713e5c38",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Note Target",
          labelPlural: "Note Targets",
          description: "A note target",
          fieldsList: [
            {
              __typename: "Field",
              id: "d1d1ff00-7330-4c8d-b9b6-ae9f713e5c38",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "7f75cbc9-d346-4fed-8a43-2cc7bf7042a9",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "99423191-b0c4-4d52-ac67-6874bb0bbeee",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "07f20f3f-e480-49c6-8d61-e8fb2f3ca07b",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "03014f09-d24f-40f8-8f8f-58d9cd749a16",
              type: "UUID",
              name: "noteId",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Note id (foreign key)",
              description: "NoteTarget note id foreign key"
            },
            {
              __typename: "Field",
              id: "e10a3026-1d61-400c-a018-281eec277d12",
              type: "RELATION",
              name: "note",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Note",
              description: "NoteTarget note",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "f5a31487-4899-45fa-a496-c93b030f7026",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "e17eb8fc-5ba9-4479-9c76-f731f8584a9a",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "e10a3026-1d61-400c-a018-281eec277d12",
                  name: "note"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "cf1e3f15-1ce2-444b-9507-69eb7dc40972",
                  nameSingular: "note",
                  namePlural: "notes"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "629b0b99-d07c-4dd8-8a15-d57c558f4046",
                  name: "noteTargets"
                }
              }
            },
            {
              __typename: "Field",
              id: "28148012-6379-4d4f-87c1-56d036f716c1",
              type: "UUID",
              name: "personId",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Person id (foreign key)",
              description: "NoteTarget person id foreign key"
            },
            {
              __typename: "Field",
              id: "5401a0b6-64af-4736-b19f-ca03bcf9c955",
              type: "RELATION",
              name: "person",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Person",
              description: "NoteTarget person",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "4beca7eb-f154-4a91-930b-91433dfa3d3a",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "e17eb8fc-5ba9-4479-9c76-f731f8584a9a",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "5401a0b6-64af-4736-b19f-ca03bcf9c955",
                  name: "person"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "49029f5c-50d8-41e7-b58c-4584ee54763f",
                  nameSingular: "person",
                  namePlural: "people"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "bcd93e0f-5451-45a5-b9e2-bc4c8a4a0b8d",
                  name: "noteTargets"
                }
              }
            },
            {
              __typename: "Field",
              id: "6dd45dba-0b1b-4910-ac70-66dcc841a398",
              type: "UUID",
              name: "companyId",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Company id (foreign key)",
              description: "NoteTarget company id foreign key"
            },
            {
              __typename: "Field",
              id: "93478ac2-8f9f-4cc4-888e-dbd6766f1769",
              type: "RELATION",
              name: "company",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Company",
              description: "NoteTarget company",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "24585994-494b-4c58-aa4f-257a6e775006",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "e17eb8fc-5ba9-4479-9c76-f731f8584a9a",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "93478ac2-8f9f-4cc4-888e-dbd6766f1769",
                  name: "company"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "d6742106-e3ac-4e28-95ad-0ae1f9f2c202",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "2be876ac-ef40-4e6d-86d0-bc89bea40ca9",
                  name: "noteTargets"
                }
              }
            },
            {
              __typename: "Field",
              id: "0644548a-9a0e-4abc-96de-1afee2a555d1",
              type: "UUID",
              name: "opportunityId",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Opportunity id (foreign key)",
              description: "NoteTarget opportunity id foreign key"
            },
            {
              __typename: "Field",
              id: "875de814-cf1d-4b7e-8038-f179c051ac0e",
              type: "RELATION",
              name: "opportunity",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Opportunity",
              description: "NoteTarget opportunity",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "85aefb41-952c-4b00-960d-b435da7ca073",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "e17eb8fc-5ba9-4479-9c76-f731f8584a9a",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "875de814-cf1d-4b7e-8038-f179c051ac0e",
                  name: "opportunity"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "4afa7501-4bd9-4ec7-bd07-ce6f69ad0d98",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "74c12c73-15b2-425c-ac93-2f877d2cfde5",
                  name: "noteTargets"
                }
              }
            },
            {
              __typename: "Field",
              id: "d80e2c74-31a0-43cc-b32f-394d260f837f",
              type: "RELATION",
              name: "pet",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.335Z",
              updatedAt: "2025-02-11T09:14:39.335Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Pet",
              description: "NoteTargets Pet",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "d925935b-7152-41a1-8859-56e6544cb93c",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "e17eb8fc-5ba9-4479-9c76-f731f8584a9a",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "d80e2c74-31a0-43cc-b32f-394d260f837f",
                  name: "pet"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "055c2349-c786-4389-b09d-09c89fc131bc",
                  nameSingular: "pet",
                  namePlural: "pets"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "5e47fe4c-df0d-4b12-98db-68a450fd7396",
                  name: "noteTargets"
                }
              }
            },
            {
              __typename: "Field",
              id: "7426b31c-2dcf-4807-8b03-2b6ce99f84f0",
              type: "UUID",
              name: "petId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.335Z",
              updatedAt: "2025-02-11T09:14:39.335Z",
              defaultValue: null,
              options: null,
              settings: {
                isForeignKey: true
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Pet ID (foreign key)",
              description: "Note Target Pet id foreign key"
            },
            {
              __typename: "Field",
              id: "ba3ef494-ed06-406e-8fba-adef99807abb",
              type: "RELATION",
              name: "surveyResult",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.052Z",
              updatedAt: "2025-02-11T09:14:40.052Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Survey result",
              description: "NoteTargets Survey result",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "5ec3cb38-9988-4c02-8652-3d3da682a342",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "e17eb8fc-5ba9-4479-9c76-f731f8584a9a",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "ba3ef494-ed06-406e-8fba-adef99807abb",
                  name: "surveyResult"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "3433f66e-e32c-4b99-b48b-38e6d23501cc",
                  nameSingular: "surveyResult",
                  namePlural: "surveyResults"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "ff3bb487-ad47-469e-a1ac-c483bca36b79",
                  name: "noteTargets"
                }
              }
            },
            {
              __typename: "Field",
              id: "b801cba0-5e89-438e-9155-07603b527bc3",
              type: "UUID",
              name: "surveyResultId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.052Z",
              updatedAt: "2025-02-11T09:14:40.052Z",
              defaultValue: null,
              options: null,
              settings: {
                isForeignKey: true
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Survey result ID (foreign key)",
              description: "Note Target Survey result id foreign key"
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "90dbc8b6-53c7-4ff0-b8a0-ef0588a21bef",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_68bce49f4de05facd5365a3a797",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "f1c0214c-f2d6-4056-8666-fd74f8f0db2a",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "6dd45dba-0b1b-4910-ac70-66dcc841a398"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "c7c95fec-6875-498a-a685-0e94df13f6d3",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_241f0cca089399c8c5954086b8d",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "497281d5-3137-4096-8168-1bc7127ef033",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "03014f09-d24f-40f8-8f8f-58d9cd749a16"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "750cd543-0c7e-48f9-b3b2-78c22c3d48bc",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_56454973bce16e65ee1ae3d2e40",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "925fc282-6238-4e40-8b94-e03d1fb26ddb",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "07f20f3f-e480-49c6-8d61-e8fb2f3ca07b"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "f902ca7e-985c-4223-8df9-9172ea2dea20",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "28148012-6379-4d4f-87c1-56d036f716c1"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "be1b1b1a-9f95-427c-9431-79ed0966e269",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_19ea95ddb39f610f7dcad4c4336",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "edd6999a-0803-4aa6-b4d9-ecf64dcc819f",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "0644548a-9a0e-4abc-96de-1afee2a555d1"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "ded05363-70e6-4a88-95f3-ce04bb547dd2",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "view",
          namePlural: "views",
          icon: "IconLayoutCollage",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "61946ba1-4743-4ced-a6d7-0d06a8c12f07",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "View",
          labelPlural: "Views",
          description: "(System) Views",
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: []
          },
          fieldsList: [
            {
              __typename: "Field",
              id: "fcd0db2e-5253-4d31-97ce-af8971e4d89a",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "e083f601-68ca-4596-8f13-c309ec841f57",
              type: "RELATION",
              name: "viewFields",
              icon: "IconTag",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "View Fields",
              description: "View Fields",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "c610eb39-51f8-4448-a267-5ddd335da103",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "ded05363-70e6-4a88-95f3-ce04bb547dd2",
                  nameSingular: "view",
                  namePlural: "views"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "e083f601-68ca-4596-8f13-c309ec841f57",
                  name: "viewFields"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "1cfe488b-b2fa-4217-849e-41ed3b1ea2cd",
                  nameSingular: "viewField",
                  namePlural: "viewFields"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "c47887a9-10a3-42ad-a48f-42c465e835e0",
                  name: "view"
                }
              }
            },
            {
              __typename: "Field",
              id: "61946ba1-4743-4ced-a6d7-0d06a8c12f07",
              type: "TEXT",
              name: "name",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Name",
              description: "View name"
            },
            {
              __typename: "Field",
              id: "14b29b8f-356d-4c2d-94dc-ada59b8c7fbb",
              type: "UUID",
              name: "objectMetadataId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Object Metadata Id",
              description: "View target object"
            },
            {
              __typename: "Field",
              id: "6661cfaf-570b-4b00-ac0e-6026de473105",
              type: "TEXT",
              name: "type",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'table'",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Type",
              description: "View type"
            },
            {
              __typename: "Field",
              id: "80ef6a40-bdc0-461e-8119-0cae65acdc02",
              type: "SELECT",
              name: "key",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'INDEX'",
              options: [
                {
                  id: "59e77822-8211-41a7-834e-1c9f40d290d9",
                  color: "red",
                  label: "Index",
                  value: "INDEX",
                  position: 0
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Key",
              description: "View key"
            },
            {
              __typename: "Field",
              id: "ef4ee434-db19-4047-8ba0-8f7290b674f0",
              type: "TEXT",
              name: "icon",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Icon",
              description: "View icon"
            },
            {
              __typename: "Field",
              id: "4e4af865-8374-433d-9286-9bfaca6ac037",
              type: "TEXT",
              name: "kanbanFieldMetadataId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "kanbanfieldMetadataId",
              description: "View Kanban column field"
            },
            {
              __typename: "Field",
              id: "501b19c7-074a-47a4-bb03-d7356161215a",
              type: "POSITION",
              name: "position",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Position",
              description: "View position"
            },
            {
              __typename: "Field",
              id: "72ec6c10-bc2d-468b-b026-98d8ee8ba92b",
              type: "BOOLEAN",
              name: "isCompact",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: false,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Compact View",
              description: "Describes if the view is in compact mode"
            },
            {
              __typename: "Field",
              id: "e5407c72-c1dd-41dc-884a-774a3ff0e267",
              type: "SELECT",
              name: "kanbanAggregateOperation",
              icon: "IconCalculator",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'COUNT'",
              options: [
                {
                  id: "4cb69809-2ec2-4bfb-a7d7-f10af37fbe6f",
                  color: "red",
                  label: "Average",
                  value: "AVG",
                  position: 0
                },
                {
                  id: "ecc40980-8ba9-4f1b-bafd-a60a31913c45",
                  color: "purple",
                  label: "Count",
                  value: "COUNT",
                  position: 1
                },
                {
                  id: "2f2b2dbc-0f2d-4565-9e67-7fe576ee4fea",
                  color: "sky",
                  label: "Maximum",
                  value: "MAX",
                  position: 2
                },
                {
                  id: "34847b03-c801-46ab-b7b1-b2f495992929",
                  color: "turquoise",
                  label: "Minimum",
                  value: "MIN",
                  position: 3
                },
                {
                  id: "4592d83b-6d46-49bb-8394-bce094cfe838",
                  color: "yellow",
                  label: "Sum",
                  value: "SUM",
                  position: 4
                },
                {
                  id: "20a768e0-4f42-4389-83a4-67253a60b7ba",
                  color: "red",
                  label: "Count empty",
                  value: "COUNT_EMPTY",
                  position: 5
                },
                {
                  id: "28db0698-e760-497d-9159-dfb870110740",
                  color: "purple",
                  label: "Count not empty",
                  value: "COUNT_NOT_EMPTY",
                  position: 6
                },
                {
                  id: "78e09597-07c3-4561-b994-8cb42408cd76",
                  color: "sky",
                  label: "Count unique values",
                  value: "COUNT_UNIQUE_VALUES",
                  position: 7
                },
                {
                  id: "05e5a22c-55e9-417a-8f41-ce2746653fef",
                  color: "turquoise",
                  label: "Percent empty",
                  value: "PERCENTAGE_EMPTY",
                  position: 8
                },
                {
                  id: "d19e1af1-19a4-4ef1-a469-a46ec2712a72",
                  color: "yellow",
                  label: "Percent not empty",
                  value: "PERCENTAGE_NOT_EMPTY",
                  position: 9
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Aggregate operation",
              description: "Optional aggregate operation"
            },
            {
              __typename: "Field",
              id: "db2237be-8908-41cd-a2e6-f96dbdbbbc71",
              type: "UUID",
              name: "kanbanAggregateOperationFieldMetadataId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Field metadata used for aggregate operation",
              description: "Field metadata used for aggregate operation"
            },
            {
              __typename: "Field",
              id: "9bb42abc-da28-4ab7-b10e-1132950a48cc",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "871b6a05-a2fa-462c-bd93-4309c88343ee",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "45bb46ae-95e7-411d-bfe2-1125ee223871",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "416300ab-6908-427d-a28e-281b9076934e",
              type: "RELATION",
              name: "viewGroups",
              icon: "IconTag",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "View Groups",
              description: "View Groups",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "d11b0440-7558-4199-8bc3-3898f8912ba4",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "ded05363-70e6-4a88-95f3-ce04bb547dd2",
                  nameSingular: "view",
                  namePlural: "views"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "416300ab-6908-427d-a28e-281b9076934e",
                  name: "viewGroups"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "91b99843-10ae-412e-b482-bd5691a18b90",
                  nameSingular: "viewGroup",
                  namePlural: "viewGroups"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "3431bb7d-0440-44f9-aa04-b34423f2d7c6",
                  name: "view"
                }
              }
            },
            {
              __typename: "Field",
              id: "6f0a0296-abf3-42fd-a882-7fadbf281ed0",
              type: "RELATION",
              name: "viewFilters",
              icon: "IconFilterBolt",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "View Filters",
              description: "View Filters",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "0e8cbad2-f76e-495d-8ef9-c3261e6b8269",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "ded05363-70e6-4a88-95f3-ce04bb547dd2",
                  nameSingular: "view",
                  namePlural: "views"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "6f0a0296-abf3-42fd-a882-7fadbf281ed0",
                  name: "viewFilters"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "65d58960-69b9-42b5-ae4b-ab82c0068dbb",
                  nameSingular: "viewFilter",
                  namePlural: "viewFilters"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "7c9fe4e1-88a5-4e9a-b02d-3376f1724073",
                  name: "view"
                }
              }
            },
            {
              __typename: "Field",
              id: "582631ee-0da9-45fd-83eb-35d9e74407c5",
              type: "RELATION",
              name: "viewFilterGroups",
              icon: "IconFilterBolt",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "View Filter Groups",
              description: "View Filter Groups",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "37cf7abf-62b2-4ca1-8de1-f0d2e88c22fb",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "ded05363-70e6-4a88-95f3-ce04bb547dd2",
                  nameSingular: "view",
                  namePlural: "views"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "582631ee-0da9-45fd-83eb-35d9e74407c5",
                  name: "viewFilterGroups"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "b73dc029-8c37-4353-be3b-a16245075f2c",
                  nameSingular: "viewFilterGroup",
                  namePlural: "viewFilterGroups"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "33436639-0b6f-4285-85ad-1a8df491ba2a",
                  name: "view"
                }
              }
            },
            {
              __typename: "Field",
              id: "bc512167-35d3-42c9-a2e7-1ee07b2f2013",
              type: "RELATION",
              name: "viewSorts",
              icon: "IconArrowsSort",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "View Sorts",
              description: "View Sorts",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "671ed16b-1aa8-4413-9594-5430537ed562",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "ded05363-70e6-4a88-95f3-ce04bb547dd2",
                  nameSingular: "view",
                  namePlural: "views"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "bc512167-35d3-42c9-a2e7-1ee07b2f2013",
                  name: "viewSorts"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "075939c1-63ef-4dfa-8d13-31ce81049259",
                  nameSingular: "viewSort",
                  namePlural: "viewSorts"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "aa369f3e-a729-4999-aeac-4fda1101752b",
                  name: "view"
                }
              }
            },
            {
              __typename: "Field",
              id: "6a6563c4-98dd-4400-bba6-e5c8a93a0d5f",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Favorites",
              description: "Favorites linked to the view",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "6a6dd17e-d29a-4c79-a52a-e571072d222f",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "ded05363-70e6-4a88-95f3-ce04bb547dd2",
                  nameSingular: "view",
                  namePlural: "views"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "6a6563c4-98dd-4400-bba6-e5c8a93a0d5f",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "7a529e4f-5458-4f8e-814e-9c0b283e2365",
                  name: "view"
                }
              }
            }
          ]
        }
      },
      {
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "dd054a83-dfee-4231-bbe0-ad690f189196",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "calendarEventParticipant",
          namePlural: "calendarEventParticipants",
          icon: "IconCalendar",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "db996c62-eb44-4381-bcc2-46989d681f3a",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Calendar event participant",
          labelPlural: "Calendar event participants",
          description: "Calendar event participants",
          fieldsList: [
            {
              __typename: "Field",
              id: "ea6dc501-8db4-42e6-9df1-271d5bd3dc0b",
              type: "UUID",
              name: "calendarEventId",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Event ID id (foreign key)",
              description: "Event ID id foreign key"
            },
            {
              __typename: "Field",
              id: "21a3c4e8-39aa-4394-8a6c-6d34009190ef",
              type: "RELATION",
              name: "calendarEvent",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Event ID",
              description: "Event ID",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "8e46a49b-4fab-421f-9dcd-862fd2e53600",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "dd054a83-dfee-4231-bbe0-ad690f189196",
                  nameSingular: "calendarEventParticipant",
                  namePlural: "calendarEventParticipants"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "21a3c4e8-39aa-4394-8a6c-6d34009190ef",
                  name: "calendarEvent"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "e327588e-09dd-445f-b7b3-28b707beb1fe",
                  nameSingular: "calendarEvent",
                  namePlural: "calendarEvents"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "52d53fb3-1199-42c2-b89a-f1a0de2e8776",
                  name: "calendarEventParticipants"
                }
              }
            },
            {
              __typename: "Field",
              id: "db996c62-eb44-4381-bcc2-46989d681f3a",
              type: "TEXT",
              name: "handle",
              icon: "IconMail",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Handle",
              description: "Handle"
            },
            {
              __typename: "Field",
              id: "24e16c8a-a239-4eb9-af01-33d283f8bda5",
              type: "TEXT",
              name: "displayName",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Display Name",
              description: "Display Name"
            },
            {
              __typename: "Field",
              id: "a21c8c9d-4e0e-4cda-b021-fe2bae2dba66",
              type: "BOOLEAN",
              name: "isOrganizer",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: false,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Is Organizer",
              description: "Is Organizer"
            },
            {
              __typename: "Field",
              id: "56b11485-2ea0-406d-9a58-d86c56752349",
              type: "SELECT",
              name: "responseStatus",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'NEEDS_ACTION'",
              options: [
                {
                  id: "a52a8178-4c12-4eb2-9852-88291e3ef0ed",
                  color: "orange",
                  label: "Needs Action",
                  value: "NEEDS_ACTION",
                  position: 0
                },
                {
                  id: "69e26b26-741e-4823-b65b-220a89139a47",
                  color: "red",
                  label: "Declined",
                  value: "DECLINED",
                  position: 1
                },
                {
                  id: "85f52676-d9c1-4e52-bdbb-ec8f9dc4f688",
                  color: "yellow",
                  label: "Tentative",
                  value: "TENTATIVE",
                  position: 2
                },
                {
                  id: "a21e2d35-43ff-4edb-9272-5e527ebd6118",
                  color: "green",
                  label: "Accepted",
                  value: "ACCEPTED",
                  position: 3
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Response Status",
              description: "Response Status"
            },
            {
              __typename: "Field",
              id: "f8347d5d-15f1-46ee-8b9d-35abb24d52be",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "58425ebe-187f-4851-a0e9-609bb4117bf2",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "117f006f-51bd-4735-80bb-80a4b61eec8c",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "e342ab63-fc79-4bd7-9090-ed168f7fcf69",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "54b49cdd-c87e-4c7f-9926-b2b9ee09c35c",
              type: "UUID",
              name: "personId",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Person id (foreign key)",
              description: "Person id foreign key"
            },
            {
              __typename: "Field",
              id: "b4d42e71-defb-4547-b82a-7a1b308d7af6",
              type: "RELATION",
              name: "person",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Person",
              description: "Person",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "a2f54abe-3d86-4161-97ca-374207b6a502",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "dd054a83-dfee-4231-bbe0-ad690f189196",
                  nameSingular: "calendarEventParticipant",
                  namePlural: "calendarEventParticipants"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "b4d42e71-defb-4547-b82a-7a1b308d7af6",
                  name: "person"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "49029f5c-50d8-41e7-b58c-4584ee54763f",
                  nameSingular: "person",
                  namePlural: "people"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "067f0ade-20c7-473c-93a9-bcbf08477ef0",
                  name: "calendarEventParticipants"
                }
              }
            },
            {
              __typename: "Field",
              id: "88e27009-0c31-436a-87ca-4e5b86df2746",
              type: "UUID",
              name: "workspaceMemberId",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Workspace Member id (foreign key)",
              description: "Workspace Member id foreign key"
            },
            {
              __typename: "Field",
              id: "94edc854-576d-4568-81a8-50fcba749840",
              type: "RELATION",
              name: "workspaceMember",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Workspace Member",
              description: "Workspace Member",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "b90c6915-1600-4ca8-b796-8dd7e5e76f5d",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "dd054a83-dfee-4231-bbe0-ad690f189196",
                  nameSingular: "calendarEventParticipant",
                  namePlural: "calendarEventParticipants"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "94edc854-576d-4568-81a8-50fcba749840",
                  name: "workspaceMember"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "c841d49e-6664-4008-80bc-905c5540671e",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "b5af82f8-31d7-4910-ad04-d83dab1ecdd0",
                  name: "calendarEventParticipants"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "f8ba2ccc-5bdb-4123-8d0d-7ec3fb3c93da",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_0da422bbe7adbabb8144c696ebd",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "49b42ade-4031-4d96-9a83-16c877d16aff",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "54b49cdd-c87e-4c7f-9926-b2b9ee09c35c"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "89b6b0d4-c612-4f58-8382-de0741cf1303",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "e342ab63-fc79-4bd7-9090-ed168f7fcf69"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "687ee676-ca9e-4206-a5e8-3e023a7ad9f4",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_2bf094726f6d91639302c1c143d",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "2a883e4d-2712-47a4-8fd5-ada250b420eb",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "88e27009-0c31-436a-87ca-4e5b86df2746"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "504537f5-91ea-40d7-85b3-655e5d2f6466",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "e342ab63-fc79-4bd7-9090-ed168f7fcf69"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "3b9b9c1f-23e4-4fb6-8daa-1f338bf93e32",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_dd22aee9059fd7002165df6d8cc",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "25d26a12-7e47-4276-a73a-b39913d740d4",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "ea6dc501-8db4-42e6-9df1-271d5bd3dc0b"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "dc01c3ca-3140-45d8-a02d-a862055ba945",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "messageFolder",
          namePlural: "messageFolders",
          icon: "IconFolder",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "2b2ebe6c-72db-47f0-b71b-4207d6b8525a",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Message Folder",
          labelPlural: "Message Folders",
          description: "Folder for Message Channel",
          fieldsList: [
            {
              __typename: "Field",
              id: "aeef177d-ea9a-409f-8a51-d33e69db4565",
              type: "TEXT",
              name: "name",
              icon: "IconFolder",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Name",
              description: "Folder name"
            },
            {
              __typename: "Field",
              id: "a99d49f3-8c56-4dde-95dc-bb0d0c3c8e13",
              type: "TEXT",
              name: "syncCursor",
              icon: "IconHash",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Sync Cursor",
              description: "Sync Cursor"
            },
            {
              __typename: "Field",
              id: "2b2ebe6c-72db-47f0-b71b-4207d6b8525a",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "070e4e23-3079-4b09-8987-0a9839ce4f39",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "b58fc16b-71fe-4289-8b4b-3d204ac7585a",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "fd64fd15-93c3-4b00-9b32-7500f1597034",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "29b1380f-42a1-4302-bc54-e42760c0b641",
              type: "UUID",
              name: "messageChannelId",
              icon: "IconMessage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Message Channel id (foreign key)",
              description: "Message Channel id foreign key"
            },
            {
              __typename: "Field",
              id: "8ca1e781-0c90-4239-8739-a8e053386f86",
              type: "RELATION",
              name: "messageChannel",
              icon: "IconMessage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Message Channel",
              description: "Message Channel",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "9153c4bc-c819-4ca6-b95a-ffabb71badbc",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "dc01c3ca-3140-45d8-a02d-a862055ba945",
                  nameSingular: "messageFolder",
                  namePlural: "messageFolders"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "8ca1e781-0c90-4239-8739-a8e053386f86",
                  name: "messageChannel"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "5deb0840-caf9-44ec-98be-8fcad3816c2f",
                  nameSingular: "messageChannel",
                  namePlural: "messageChannels"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "a83b1fe2-5b63-4f9e-96d1-81f0b34858b2",
                  name: "messageFolders"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "5b934899-cfe6-41c0-9937-978f12373d61",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_8606361c00c3d44e1a23024e1f8",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "625c589a-6105-4d16-9cc9-2231013cd5d0",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "fd64fd15-93c3-4b00-9b32-7500f1597034"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "2419114a-da95-4fe5-8833-de69507ab851",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "29b1380f-42a1-4302-bc54-e42760c0b641"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "d6742106-e3ac-4e28-95ad-0ae1f9f2c202",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "company",
          namePlural: "companies",
          icon: "IconBuildingSkyscraper",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: false,
          isSearchable: true,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "585c1f2f-21d0-49d6-9d63-f830010a79da",
          imageIdentifierFieldMetadataId: null,
          shortcut: "C",
          isLabelSyncedWithName: false,
          labelSingular: "Company",
          labelPlural: "Companies",
          description: "A company",
          fieldsList: [
            {
              __typename: "Field",
              id: "585c1f2f-21d0-49d6-9d63-f830010a79da",
              type: "TEXT",
              name: "name",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Name",
              description: "The company name"
            },
            {
              __typename: "Field",
              id: "8dc42ef3-c465-42d2-9a87-e6648737dc64",
              type: "LINKS",
              name: "domainName",
              icon: "IconLink",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: true,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: {
                primaryLinkUrl: "''",
                secondaryLinks: "'[]'",
                primaryLinkLabel: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Domain Name",
              description: "The company website URL. We use this url to fetch the company icon"
            },
            {
              __typename: "Field",
              id: "c2f19ea6-0905-4f6c-a2db-9ab8a6fea903",
              type: "NUMBER",
              name: "employees",
              icon: "IconUsers",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Employees",
              description: "Number of employees in the company"
            },
            {
              __typename: "Field",
              id: "3affc97c-5164-4feb-8554-33ce0b49cf6b",
              type: "LINKS",
              name: "linkedinLink",
              icon: "IconBrandLinkedin",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: {
                primaryLinkUrl: "''",
                secondaryLinks: "'[]'",
                primaryLinkLabel: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Linkedin",
              description: "The company Linkedin account"
            },
            {
              __typename: "Field",
              id: "32149109-03fc-445f-b62d-d98a9d97a336",
              type: "LINKS",
              name: "xLink",
              icon: "IconBrandX",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: {
                primaryLinkUrl: "''",
                secondaryLinks: "'[]'",
                primaryLinkLabel: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "X",
              description: "The company Twitter/X account"
            },
            {
              __typename: "Field",
              id: "8d4b6566-3f54-4448-9ccc-93ddf073ab38",
              type: "CURRENCY",
              name: "annualRecurringRevenue",
              icon: "IconMoneybag",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: {
                amountMicros: null,
                currencyCode: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "ARR",
              description: "Annual Recurring Revenue: The actual or estimated annual revenue of the company"
            },
            {
              __typename: "Field",
              id: "ccd3c5ef-3cdf-4087-a4e9-42afcd75893f",
              type: "ADDRESS",
              name: "address",
              icon: "IconMap",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: {
                addressLat: null,
                addressLng: null,
                addressCity: "''",
                addressState: "''",
                addressCountry: "''",
                addressStreet1: "''",
                addressStreet2: "''",
                addressPostcode: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Address",
              description: "Address of the company"
            },
            {
              __typename: "Field",
              id: "1bb0336f-b475-4d3a-a4c1-3f3c591ccb2f",
              type: "BOOLEAN",
              name: "idealCustomerProfile",
              icon: "IconTarget",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: false,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "ICP",
              description: "Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you"
            },
            {
              __typename: "Field",
              id: "2f81e8dd-8932-4f3b-88be-e25d39051fe0",
              type: "POSITION",
              name: "position",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Position",
              description: "Company record position"
            },
            {
              __typename: "Field",
              id: "13b45d51-fd13-465a-a90d-b854fa990224",
              type: "ACTOR",
              name: "createdBy",
              icon: "IconCreativeCommonsSa",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: {
                name: "'System'",
                source: "'MANUAL'",
                context: {}
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Created by",
              description: "The creator of the record"
            },
            {
              __typename: "Field",
              id: "e3c53498-c8f0-4976-838b-902cd268a317",
              type: "TS_VECTOR",
              name: "searchVector",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Search vector",
              description: "Field used for full-text search"
            },
            {
              __typename: "Field",
              id: "a223f4a8-e57c-4aaf-8839-27c7c03f9b72",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "789749d5-7e19-4582-bab1-0271679bdd5b",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "99dc9efb-cb2c-42be-93be-b19c9f762b4f",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "9d693bca-8307-44c0-a677-93af987342c8",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "b78b28ae-adf1-4a1f-a984-4f6ab30504fa",
              type: "RELATION",
              name: "people",
              icon: "IconUsers",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "People",
              description: "People linked to the company.",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "139d9ea0-1e53-4fa7-bd92-222eff4c04b3",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "d6742106-e3ac-4e28-95ad-0ae1f9f2c202",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "b78b28ae-adf1-4a1f-a984-4f6ab30504fa",
                  name: "people"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "49029f5c-50d8-41e7-b58c-4584ee54763f",
                  nameSingular: "person",
                  namePlural: "people"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "059cf3a7-47bb-4aef-ada1-3247d1c322c9",
                  name: "company"
                }
              }
            },
            {
              __typename: "Field",
              id: "1837def0-99e6-4d4e-9187-246cf7f9d4bd",
              type: "UUID",
              name: "accountOwnerId",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Account Owner id (foreign key)",
              description: "Your team member responsible for managing the company account id foreign key"
            },
            {
              __typename: "Field",
              id: "6a561a3d-6ae9-4350-9616-7f689f1e293d",
              type: "RELATION",
              name: "accountOwner",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Account Owner",
              description: "Your team member responsible for managing the company account",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "7c74123c-dd7a-4f71-8a75-184c92c55b55",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "d6742106-e3ac-4e28-95ad-0ae1f9f2c202",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "6a561a3d-6ae9-4350-9616-7f689f1e293d",
                  name: "accountOwner"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "c841d49e-6664-4008-80bc-905c5540671e",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "c58d0a56-a328-4071-920a-799b74362c7b",
                  name: "accountOwnerForCompanies"
                }
              }
            },
            {
              __typename: "Field",
              id: "93ebdd78-0e1c-4ad3-855a-7e655ecb697d",
              type: "RELATION",
              name: "taskTargets",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Tasks",
              description: "Tasks tied to the company",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "8f5823cf-7f62-49de-8fb2-f5e79259b06e",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "d6742106-e3ac-4e28-95ad-0ae1f9f2c202",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "93ebdd78-0e1c-4ad3-855a-7e655ecb697d",
                  name: "taskTargets"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "6b82ae18-f0ee-4d8a-bf82-b7b1344b6109",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "34e47260-354e-488e-a6ce-be7d853e0c54",
                  name: "company"
                }
              }
            },
            {
              __typename: "Field",
              id: "2be876ac-ef40-4e6d-86d0-bc89bea40ca9",
              type: "RELATION",
              name: "noteTargets",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Notes",
              description: "Notes tied to the company",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "24585994-494b-4c58-aa4f-257a6e775006",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "d6742106-e3ac-4e28-95ad-0ae1f9f2c202",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "2be876ac-ef40-4e6d-86d0-bc89bea40ca9",
                  name: "noteTargets"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "e17eb8fc-5ba9-4479-9c76-f731f8584a9a",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "93478ac2-8f9f-4cc4-888e-dbd6766f1769",
                  name: "company"
                }
              }
            },
            {
              __typename: "Field",
              id: "35805f7e-a952-4380-a2ba-00819b01e283",
              type: "RELATION",
              name: "opportunities",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Opportunities",
              description: "Opportunities linked to the company.",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "3b094cbc-081f-494b-96b3-04d54ba444eb",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "d6742106-e3ac-4e28-95ad-0ae1f9f2c202",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "35805f7e-a952-4380-a2ba-00819b01e283",
                  name: "opportunities"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "4afa7501-4bd9-4ec7-bd07-ce6f69ad0d98",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "f5459822-2e2e-4d4e-be6b-d2499a5c913f",
                  name: "company"
                }
              }
            },
            {
              __typename: "Field",
              id: "6c7f1423-f979-450f-9d27-ac52e0462d4d",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Favorites",
              description: "Favorites linked to the company",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "5cab401b-8f5c-4633-b7c0-29c3fc4069f4",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "d6742106-e3ac-4e28-95ad-0ae1f9f2c202",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "6c7f1423-f979-450f-9d27-ac52e0462d4d",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "747f73c5-1cdc-4601-99cc-2adfbf7595dd",
                  name: "company"
                }
              }
            },
            {
              __typename: "Field",
              id: "8cb39349-1e8d-49ca-b73a-195dd690ccaf",
              type: "RELATION",
              name: "attachments",
              icon: "IconFileImport",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Attachments",
              description: "Attachments linked to the company",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "ea7adf3b-7673-4cd6-9747-775023bf3c15",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "d6742106-e3ac-4e28-95ad-0ae1f9f2c202",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "8cb39349-1e8d-49ca-b73a-195dd690ccaf",
                  name: "attachments"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "b488fc13-032b-434c-acc9-a1b1cd9ad0d1",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "401197af-856a-490a-bc7a-d8fa1b753568",
                  name: "company"
                }
              }
            },
            {
              __typename: "Field",
              id: "bd5614ba-baf1-4929-96f8-9893225809bc",
              type: "RELATION",
              name: "timelineActivities",
              icon: "IconIconTimelineEvent",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Timeline Activities",
              description: "Timeline Activities linked to the company",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "6552eced-5240-43d2-8e74-c0f4955f92b0",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "d6742106-e3ac-4e28-95ad-0ae1f9f2c202",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "bd5614ba-baf1-4929-96f8-9893225809bc",
                  name: "timelineActivities"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "417786ec-7358-4019-b72b-6002551ed5e8",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "e1f28827-ab56-483a-af41-e696fcf65b02",
                  name: "company"
                }
              }
            },
            {
              __typename: "Field",
              id: "d9e74bbc-407a-4d63-a7f1-739f1702d00c",
              type: "TEXT",
              name: "tagline",
              icon: "IconAdCircle",
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:38.887Z",
              updatedAt: "2025-02-11T09:14:38.887Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Tagline",
              description: "Company's Tagline"
            },
            {
              __typename: "Field",
              id: "87d9e7db-c007-4cbb-98e6-199150ef027c",
              type: "LINKS",
              name: "introVideo",
              icon: "IconVideo",
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:38.890Z",
              updatedAt: "2025-02-11T09:14:38.890Z",
              defaultValue: {
                primaryLinkUrl: "''",
                secondaryLinks: "'[]'",
                primaryLinkLabel: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Intro Video",
              description: "Company's Intro Video"
            },
            {
              __typename: "Field",
              id: "b314982d-ab18-46ac-bedc-4d1bf0bb1ea9",
              type: "MULTI_SELECT",
              name: "workPolicy",
              icon: "IconHome",
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:38.892Z",
              updatedAt: "2025-02-11T09:14:38.892Z",
              defaultValue: null,
              options: [
                {
                  id: "ee1b741b-0359-4ffd-b866-506e7b9c0cd9",
                  color: "green",
                  label: "On-Site",
                  value: "ON_SITE",
                  position: 0
                },
                {
                  id: "3b2ed882-ec07-43fd-96e6-0fca8669c1f5",
                  color: "turquoise",
                  label: "Hybrid",
                  value: "HYBRID",
                  position: 1
                },
                {
                  id: "a60686e4-4e25-457c-a739-3b3b249fdc67",
                  color: "sky",
                  label: "Remote Work",
                  value: "REMOTE_WORK",
                  position: 2
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Work Policy",
              description: "Company's Work Policy"
            },
            {
              __typename: "Field",
              id: "c6dfcc2d-dc84-4553-94df-3b75cccee53c",
              type: "SELECT",
              name: "internalCompetitions",
              icon: "IconHome",
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:38.892Z",
              updatedAt: "2025-02-11T09:14:38.892Z",
              defaultValue: null,
              options: [
                {
                  id: "ee1b741b-0359-4ffd-b866-506e7b9c0cd9",
                  color: "green",
                  label: "Best employy",
                  value: "BEST_EMPLOYEE",
                  position: 0
                },
                {
                  id: "3b2ed882-ec07-43fd-96e6-0fca8669c1f5",
                  color: "turquoise",
                  label: "Ultimate debugger",
                  value: "ULTIMATE_DEBUGGER",
                  position: 1
                },
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Internal competitions",
              description: "Internal competitions"
            },
            {
              __typename: "Field",
              id: "8b1b88c0-a802-4c5d-8632-a4e343f3c8f1",
              type: "BOOLEAN",
              name: "visaSponsorship",
              icon: "IconBrandVisa",
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:38.894Z",
              updatedAt: "2025-02-11T09:14:38.894Z",
              defaultValue: false,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Visa Sponsorship",
              description: "Company's Visa Sponsorship Policy"
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "520277e8-248f-44d0-9fc6-fddadef27bf8",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_UNIQUE_2a32339058d0b6910b0834ddf81",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: true,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "cd179d0f-efc6-4864-8688-f8197d678b76",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "8dc42ef3-c465-42d2-9a87-e6648737dc64"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "5785a2f7-9fbf-42be-8381-2254ff17c055",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_fb1f4905546cfc6d70a971c76f7",
                  indexWhereClause: null,
                  indexType: "GIN",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "8d947072-d9ed-4b61-9797-7a3e57c210f7",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "e3c53498-c8f0-4976-838b-902cd268a317"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "34b0c70e-6f11-464c-b4f1-315b59264702",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_123501237187c835ede626367b7",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: []
                  }
                }
              }
            ]
          }
        }
      },
      {
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "cf1e3f15-1ce2-444b-9507-69eb7dc40972",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "note",
          namePlural: "notes",
          icon: "IconNotes",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: false,
          isSearchable: true,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "28d93256-a262-422a-8f19-fbe1329fedfb",
          imageIdentifierFieldMetadataId: null,
          shortcut: "N",
          isLabelSyncedWithName: false,
          labelSingular: "Note",
          labelPlural: "Notes",
          description: "A note",
          fieldsList: [
            {
              __typename: "Field",
              id: "68a690be-2099-4454-a473-126987d7a899",
              type: "POSITION",
              name: "position",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Position",
              description: "Note record position"
            },
            {
              __typename: "Field",
              id: "28d93256-a262-422a-8f19-fbe1329fedfb",
              type: "TEXT",
              name: "title",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Title",
              description: "Note title"
            },
            {
              __typename: "Field",
              id: "dfeb45c6-9b78-49fb-aafa-803dbf122669",
              type: "RICH_TEXT",
              name: "body",
              icon: "IconFilePencil",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Body",
              description: "Note body"
            },
            {
              __typename: "Field",
              id: "b819bf7f-826a-4a83-84d9-7be9d146ad82",
              type: "ACTOR",
              name: "createdBy",
              icon: "IconCreativeCommonsSa",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: {
                name: "'System'",
                source: "'MANUAL'",
                context: {}
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Created by",
              description: "The creator of the record"
            },
            {
              __typename: "Field",
              id: "ee2ba888-7fc2-4433-a2f0-9ac766568401",
              type: "TS_VECTOR",
              name: "searchVector",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Search vector",
              description: "Field used for full-text search"
            },
            {
              __typename: "Field",
              id: "f36a5361-c5a3-46af-b6d4-20b89976aaa4",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "2797069c-0b5e-400b-8a3d-122ef5115c14",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "4a870094-d545-4038-b1f6-0cdf827bd841",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "7b0f2d96-88f7-41ee-8f88-07b68643fc97",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "629b0b99-d07c-4dd8-8a15-d57c558f4046",
              type: "RELATION",
              name: "noteTargets",
              icon: "IconArrowUpRight",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Relations",
              description: "Note targets",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "f5a31487-4899-45fa-a496-c93b030f7026",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "cf1e3f15-1ce2-444b-9507-69eb7dc40972",
                  nameSingular: "note",
                  namePlural: "notes"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "629b0b99-d07c-4dd8-8a15-d57c558f4046",
                  name: "noteTargets"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "e17eb8fc-5ba9-4479-9c76-f731f8584a9a",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "e10a3026-1d61-400c-a018-281eec277d12",
                  name: "note"
                }
              }
            },
            {
              __typename: "Field",
              id: "010c6b85-9845-48b8-8636-91404383538c",
              type: "RELATION",
              name: "attachments",
              icon: "IconFileImport",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Attachments",
              description: "Note attachments",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "8c6e551c-fab9-4646-94e5-bdca0050118a",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "cf1e3f15-1ce2-444b-9507-69eb7dc40972",
                  nameSingular: "note",
                  namePlural: "notes"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "010c6b85-9845-48b8-8636-91404383538c",
                  name: "attachments"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "b488fc13-032b-434c-acc9-a1b1cd9ad0d1",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "ef1388d8-4dad-42f2-93bb-59d817577917",
                  name: "note"
                }
              }
            },
            {
              __typename: "Field",
              id: "2791c2d9-6189-4240-9a9a-d9489faa764e",
              type: "RELATION",
              name: "timelineActivities",
              icon: "IconTimelineEvent",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Timeline Activities",
              description: "Timeline Activities linked to the note.",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "9457ea57-a118-4b96-96a4-a8f83612025d",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "cf1e3f15-1ce2-444b-9507-69eb7dc40972",
                  nameSingular: "note",
                  namePlural: "notes"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "2791c2d9-6189-4240-9a9a-d9489faa764e",
                  name: "timelineActivities"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "417786ec-7358-4019-b72b-6002551ed5e8",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "e2fd43a9-dc31-4392-8dbf-90b8ad211c3d",
                  name: "note"
                }
              }
            },
            {
              __typename: "Field",
              id: "f357864e-28bf-4ea3-b8b6-11610791b673",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Favorites",
              description: "Favorites linked to the note",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "b3ed12e9-211f-406e-9e1b-1928077bd170",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "cf1e3f15-1ce2-444b-9507-69eb7dc40972",
                  nameSingular: "note",
                  namePlural: "notes"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "f357864e-28bf-4ea3-b8b6-11610791b673",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "ffd3df52-6009-4eb4-9357-04c11f7d2cac",
                  name: "note"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "cf67c450-bcf9-419c-9150-fcb15a3d6c94",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_f20de8d7fc74a405e4083051275",
                  indexWhereClause: null,
                  indexType: "GIN",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "ff59e9d8-6ffe-460a-8ccd-f9c6a429c568",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "ee2ba888-7fc2-4433-a2f0-9ac766568401"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "cd2e1f83-3e54-48b5-83bd-ff4338add50d",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "connectedAccount",
          namePlural: "connectedAccounts",
          icon: "IconAt",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "9db27f2b-a332-4017-9f55-142d877b2fee",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Connected Account",
          labelPlural: "Connected Accounts",
          description: "A connected account",
          fieldsList: [
            {
              __typename: "Field",
              id: "9db27f2b-a332-4017-9f55-142d877b2fee",
              type: "TEXT",
              name: "handle",
              icon: "IconMail",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "handle",
              description: "The account handle (email, username, phone number, etc.)"
            },
            {
              __typename: "Field",
              id: "2aded1e7-653f-4b35-83c1-9cf16305fb6e",
              type: "TEXT",
              name: "provider",
              icon: "IconSettings",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "provider",
              description: "The account provider"
            },
            {
              __typename: "Field",
              id: "d3e1126a-5602-462b-824f-e2c88a92ae3d",
              type: "TEXT",
              name: "accessToken",
              icon: "IconKey",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Access Token",
              description: "Messaging provider access token"
            },
            {
              __typename: "Field",
              id: "bdead644-fdb8-4045-b2f2-2783410394bb",
              type: "TEXT",
              name: "refreshToken",
              icon: "IconKey",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Refresh Token",
              description: "Messaging provider refresh token"
            },
            {
              __typename: "Field",
              id: "bf941bed-76f6-4b2f-bd4d-25a136767a74",
              type: "TEXT",
              name: "lastSyncHistoryId",
              icon: "IconHistory",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last sync history ID",
              description: "Last sync history ID"
            },
            {
              __typename: "Field",
              id: "77d5464c-70b9-4e4d-ac2b-676760f8f734",
              type: "DATE_TIME",
              name: "authFailedAt",
              icon: "IconX",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Auth failed at",
              description: "Auth failed at"
            },
            {
              __typename: "Field",
              id: "eabd1f5b-cae2-42f4-adb9-bb3ab58d64ab",
              type: "TEXT",
              name: "handleAliases",
              icon: "IconMail",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Handle Aliases",
              description: "Handle Aliases"
            },
            {
              __typename: "Field",
              id: "120d9676-93a4-4245-aa78-f38492b7bd99",
              type: "ARRAY",
              name: "scopes",
              icon: "IconSettings",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Scopes",
              description: "Scopes"
            },
            {
              __typename: "Field",
              id: "318d4d44-677c-489c-af1d-d2c16bc21f95",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "1a3961b5-3e60-4780-b68a-71ce03b78a56",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "094e2e01-bad2-47dc-8b41-d57d3761d6ef",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "c7479abb-dd51-4ef2-b17a-cb93bb11979a",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "6d3622ca-ebad-4701-9095-7a87159d7b77",
              type: "UUID",
              name: "accountOwnerId",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Account Owner id (foreign key)",
              description: "Account Owner id foreign key"
            },
            {
              __typename: "Field",
              id: "8bae94b3-c5eb-4d64-9f40-7f44ed39a2cb",
              type: "RELATION",
              name: "accountOwner",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Account Owner",
              description: "Account Owner",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "4cb38c10-1f29-4401-9984-6b10e30ef0ff",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "cd2e1f83-3e54-48b5-83bd-ff4338add50d",
                  nameSingular: "connectedAccount",
                  namePlural: "connectedAccounts"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "8bae94b3-c5eb-4d64-9f40-7f44ed39a2cb",
                  name: "accountOwner"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "c841d49e-6664-4008-80bc-905c5540671e",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "466c46f8-22f3-4989-ad1b-3d95b83a2ea6",
                  name: "connectedAccounts"
                }
              }
            },
            {
              __typename: "Field",
              id: "32f9c6ab-25c0-4d5f-b375-efe1c22dafc7",
              type: "RELATION",
              name: "messageChannels",
              icon: "IconMessage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Message Channels",
              description: "Message Channels",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "6e1db9e6-ab3c-400c-9628-924c4ca05250",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "cd2e1f83-3e54-48b5-83bd-ff4338add50d",
                  nameSingular: "connectedAccount",
                  namePlural: "connectedAccounts"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "32f9c6ab-25c0-4d5f-b375-efe1c22dafc7",
                  name: "messageChannels"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "5deb0840-caf9-44ec-98be-8fcad3816c2f",
                  nameSingular: "messageChannel",
                  namePlural: "messageChannels"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "4212965a-5878-495b-a6be-7eb8fa890aae",
                  name: "connectedAccount"
                }
              }
            },
            {
              __typename: "Field",
              id: "67dcf871-9baa-460a-b40a-85d137bd02f6",
              type: "RELATION",
              name: "calendarChannels",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Calendar Channels",
              description: "Calendar Channels",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "2f7c0663-cee2-4b82-b5fc-94c99ef20299",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "cd2e1f83-3e54-48b5-83bd-ff4338add50d",
                  nameSingular: "connectedAccount",
                  namePlural: "connectedAccounts"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "67dcf871-9baa-460a-b40a-85d137bd02f6",
                  name: "calendarChannels"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "5b44308a-da32-447e-b210-bf52f1230689",
                  nameSingular: "calendarChannel",
                  namePlural: "calendarChannels"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "93fc5679-12be-4449-be39-437b82da4abb",
                  name: "connectedAccount"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "608b9575-f14f-4716-b8ee-fb50b5141430",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_7d1b454b2a538273bdb947e848f",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "c9aaa2fb-362f-429d-9923-f2929972ecab",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "6d3622ca-ebad-4701-9095-7a87159d7b77"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "3e8f0bd7-9984-4441-8d06-e06760bc9732",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "c7479abb-dd51-4ef2-b17a-cb93bb11979a"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "c841d49e-6664-4008-80bc-905c5540671e",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "workspaceMember",
          namePlural: "workspaceMembers",
          icon: "IconUserCircle",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "08b10273-9750-4bc6-9f83-8cbad795bf18",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Workspace Member",
          labelPlural: "Workspace Members",
          description: "A workspace member",
          fieldsList: [
            {
              __typename: "Field",
              id: "08b10273-9750-4bc6-9f83-8cbad795bf18",
              type: "FULL_NAME",
              name: "name",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: {
                lastName: "''",
                firstName: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Name",
              description: "Workspace member name"
            },
            {
              __typename: "Field",
              id: "3b5f3aba-a246-4767-85dc-fd83690606c7",
              type: "TEXT",
              name: "colorScheme",
              icon: "IconColorSwatch",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'System'",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Color Scheme",
              description: "Preferred color scheme"
            },
            {
              __typename: "Field",
              id: "79d895a5-24a7-417e-b6bc-92d5c8d091b9",
              type: "TEXT",
              name: "locale",
              icon: "IconLanguage",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'en'",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Language",
              description: "Preferred language"
            },
            {
              __typename: "Field",
              id: "b5bcd8f8-da63-43a9-9c15-cb22cb4b2583",
              type: "TEXT",
              name: "avatarUrl",
              icon: "IconFileUpload",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Avatar Url",
              description: "Workspace member avatar"
            },
            {
              __typename: "Field",
              id: "0a435017-f783-4511-b7f7-b46944172e8f",
              type: "TEXT",
              name: "userEmail",
              icon: "IconMail",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "User Email",
              description: "Related user email address"
            },
            {
              __typename: "Field",
              id: "06323a56-f359-4b99-970e-7736f7d6dd91",
              type: "UUID",
              name: "userId",
              icon: "IconCircleUsers",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "User Id",
              description: "Associated User Id"
            },
            {
              __typename: "Field",
              id: "e327ea99-603e-4d3d-aafe-e1728cee7945",
              type: "TEXT",
              name: "timeZone",
              icon: "IconTimezone",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'system'",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Time zone",
              description: "User time zone"
            },
            {
              __typename: "Field",
              id: "ddfc4015-9ee1-48b1-b5d4-586812b220e3",
              type: "SELECT",
              name: "dateFormat",
              icon: "IconCalendarEvent",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'SYSTEM'",
              options: [
                {
                  id: "9b943985-b335-4dff-8553-f995ca79bcf4",
                  color: "turquoise",
                  label: "System",
                  value: "SYSTEM",
                  position: 0
                },
                {
                  id: "2ee0edc9-0a8d-4f03-8996-3719e6e9f5b5",
                  color: "red",
                  label: "Month First",
                  value: "MONTH_FIRST",
                  position: 1
                },
                {
                  id: "af9fc58a-6a15-4ef5-8a8e-9e6ddaebcf99",
                  color: "purple",
                  label: "Day First",
                  value: "DAY_FIRST",
                  position: 2
                },
                {
                  id: "575d3943-54ea-439d-8b61-d842898cb27a",
                  color: "sky",
                  label: "Year First",
                  value: "YEAR_FIRST",
                  position: 3
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Date format",
              description: "User's preferred date format"
            },
            {
              __typename: "Field",
              id: "31d93000-ff06-47ca-ab1a-ee47f062914e",
              type: "SELECT",
              name: "timeFormat",
              icon: "IconClock2",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'SYSTEM'",
              options: [
                {
                  id: "b7f995b7-0165-4b24-90ba-c7922054c922",
                  color: "sky",
                  label: "System",
                  value: "SYSTEM",
                  position: 0
                },
                {
                  id: "ca4c8f84-dab2-404f-8148-e2aa8a9c0203",
                  color: "red",
                  label: "24HRS",
                  value: "HOUR_24",
                  position: 1
                },
                {
                  id: "b202b5cb-7cce-4358-9d4b-e5a99a6e2554",
                  color: "purple",
                  label: "12HRS",
                  value: "HOUR_12",
                  position: 2
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Time format",
              description: "User's preferred time format"
            },
            {
              __typename: "Field",
              id: "bcab7989-0e25-4803-b8f2-3acfa2079bf6",
              type: "TS_VECTOR",
              name: "searchVector",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Search vector",
              description: "Field used for full-text search"
            },
            {
              __typename: "Field",
              id: "0abab281-fdfe-4e4d-b94c-9cc3bc2cbae3",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "f6b834d9-20f7-4d8c-b1d3-70f677bf82ae",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "f10e3c5d-ce36-4903-b560-b80c08d0dfc4",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "ac1a74e9-7f6e-457e-be02-1486c99616c6",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "7e5ed44b-6404-4aca-8af7-047ea149e7f0",
              type: "RELATION",
              name: "assignedTasks",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Assigned tasks",
              description: "Tasks assigned to the workspace member",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "1ed21ca9-1005-4781-b70b-24ac933ad7d1",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "c841d49e-6664-4008-80bc-905c5540671e",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "7e5ed44b-6404-4aca-8af7-047ea149e7f0",
                  name: "assignedTasks"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "18ff5583-7593-422c-abea-ced0195e281d",
                  nameSingular: "task",
                  namePlural: "tasks"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "dcd46f0a-f631-43df-a474-ae72ce2b17dd",
                  name: "assignee"
                }
              }
            },
            {
              __typename: "Field",
              id: "2a1f9f54-408d-49b7-8a90-0145828e6fe4",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Favorites",
              description: "Favorites linked to the workspace member",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "68b577d8-35aa-4e4f-8c3c-9010e82b174d",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "c841d49e-6664-4008-80bc-905c5540671e",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "2a1f9f54-408d-49b7-8a90-0145828e6fe4",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "0447657b-e2a8-4f8b-ad9b-aa9509ac0ac2",
                  name: "workspaceMember"
                }
              }
            },
            {
              __typename: "Field",
              id: "c58d0a56-a328-4071-920a-799b74362c7b",
              type: "RELATION",
              name: "accountOwnerForCompanies",
              icon: "IconBriefcase",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Account Owner For Companies",
              description: "Account owner for companies",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "7c74123c-dd7a-4f71-8a75-184c92c55b55",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "c841d49e-6664-4008-80bc-905c5540671e",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "c58d0a56-a328-4071-920a-799b74362c7b",
                  name: "accountOwnerForCompanies"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "d6742106-e3ac-4e28-95ad-0ae1f9f2c202",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "6a561a3d-6ae9-4350-9616-7f689f1e293d",
                  name: "accountOwner"
                }
              }
            },
            {
              __typename: "Field",
              id: "99ee0445-5b57-418e-af33-8bcf11c1c55c",
              type: "RELATION",
              name: "authoredAttachments",
              icon: "IconFileImport",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Authored attachments",
              description: "Attachments created by the workspace member",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "cf957dc0-f40a-46db-8e3b-32e146127784",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "c841d49e-6664-4008-80bc-905c5540671e",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "99ee0445-5b57-418e-af33-8bcf11c1c55c",
                  name: "authoredAttachments"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "b488fc13-032b-434c-acc9-a1b1cd9ad0d1",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "e938336b-1b26-47c4-8242-1a08f82a9ce6",
                  name: "author"
                }
              }
            },
            {
              __typename: "Field",
              id: "466c46f8-22f3-4989-ad1b-3d95b83a2ea6",
              type: "RELATION",
              name: "connectedAccounts",
              icon: "IconAt",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Connected accounts",
              description: "Connected accounts",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "4cb38c10-1f29-4401-9984-6b10e30ef0ff",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "c841d49e-6664-4008-80bc-905c5540671e",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "466c46f8-22f3-4989-ad1b-3d95b83a2ea6",
                  name: "connectedAccounts"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "cd2e1f83-3e54-48b5-83bd-ff4338add50d",
                  nameSingular: "connectedAccount",
                  namePlural: "connectedAccounts"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "8bae94b3-c5eb-4d64-9f40-7f44ed39a2cb",
                  name: "accountOwner"
                }
              }
            },
            {
              __typename: "Field",
              id: "ac0efdd1-178e-47c1-a2f4-2add422b5718",
              type: "RELATION",
              name: "messageParticipants",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Message Participants",
              description: "Message Participants",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "032354ca-4473-4e89-8b6d-0b47c02b0638",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "c841d49e-6664-4008-80bc-905c5540671e",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "ac0efdd1-178e-47c1-a2f4-2add422b5718",
                  name: "messageParticipants"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "36411ed2-cbfe-44d4-bab6-52148d4d4485",
                  nameSingular: "messageParticipant",
                  namePlural: "messageParticipants"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "e9336814-40bf-49d2-9c7e-dae6af9d077b",
                  name: "workspaceMember"
                }
              }
            },
            {
              __typename: "Field",
              id: "1b92ad62-0000-47cf-b91d-3293993f8e9c",
              type: "RELATION",
              name: "blocklist",
              icon: "IconForbid2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Blocklist",
              description: "Blocklisted handles",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "43b47587-ad44-4259-9eb0-bae019e2f142",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "c841d49e-6664-4008-80bc-905c5540671e",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "1b92ad62-0000-47cf-b91d-3293993f8e9c",
                  name: "blocklist"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "b21d7735-22be-4a25-af4c-b33157e07a90",
                  nameSingular: "blocklist",
                  namePlural: "blocklists"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "b37d7cda-7edd-4fb7-8443-4cb60d16bfa5",
                  name: "workspaceMember"
                }
              }
            },
            {
              __typename: "Field",
              id: "b5af82f8-31d7-4910-ad04-d83dab1ecdd0",
              type: "RELATION",
              name: "calendarEventParticipants",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Calendar Event Participants",
              description: "Calendar Event Participants",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "b90c6915-1600-4ca8-b796-8dd7e5e76f5d",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "c841d49e-6664-4008-80bc-905c5540671e",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "b5af82f8-31d7-4910-ad04-d83dab1ecdd0",
                  name: "calendarEventParticipants"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "dd054a83-dfee-4231-bbe0-ad690f189196",
                  nameSingular: "calendarEventParticipant",
                  namePlural: "calendarEventParticipants"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "94edc854-576d-4568-81a8-50fcba749840",
                  name: "workspaceMember"
                }
              }
            },
            {
              __typename: "Field",
              id: "deddc049-d741-4f44-a8fb-55c36634b673",
              type: "RELATION",
              name: "timelineActivities",
              icon: "IconTimelineEvent",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Events",
              description: "Events linked to the workspace member",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "904b7480-638d-4cc2-accc-911e342fc66b",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "c841d49e-6664-4008-80bc-905c5540671e",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "deddc049-d741-4f44-a8fb-55c36634b673",
                  name: "timelineActivities"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "417786ec-7358-4019-b72b-6002551ed5e8",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "eff8454d-8225-4237-bdc2-22e0117719db",
                  name: "workspaceMember"
                }
              }
            },
            {
              __typename: "Field",
              id: "6ab4ce90-581f-425b-bbba-6ce5adc70f25",
              type: "RELATION",
              name: "auditLogs",
              icon: "IconTimelineEvent",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Audit Logs",
              description: "Audit Logs linked to the workspace member",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "0aa8e034-da5b-4c62-bcba-625bad969e66",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "c841d49e-6664-4008-80bc-905c5540671e",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "6ab4ce90-581f-425b-bbba-6ce5adc70f25",
                  name: "auditLogs"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "e21f9dfe-5af9-4e02-b7b4-4467240243a7",
                  nameSingular: "auditLog",
                  namePlural: "auditLogs"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "6f5a9d78-2e2c-43a3-abe1-c4159784f6fe",
                  name: "workspaceMember"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "a5003c53-27ae-4a1d-8625-e74fb6529d3e",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_e47451872f70c8f187a6b460ac7",
                  indexWhereClause: null,
                  indexType: "GIN",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "6ea2990c-3123-4619-8dc9-063f31b1af79",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "bcab7989-0e25-4803-b8f2-3acfa2079bf6"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "c3afbe81-489c-4aa2-bdee-b83beb407bc2",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "messageThread",
          namePlural: "messageThreads",
          icon: "IconMessage",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "f14938c3-58cc-4896-85a7-cea1c6fe9d0f",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Message Thread",
          labelPlural: "Message Threads",
          description: "A group of related messages (e.g. email thread, chat thread)",
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: []
          },
          fieldsList: [
            {
              __typename: "Field",
              id: "f14938c3-58cc-4896-85a7-cea1c6fe9d0f",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "7c1add94-82b8-46ad-85a3-49fcad8aca9c",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "3258cc69-716b-4f34-9bc2-cbf2a925ee22",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "eed381af-165d-40a1-a6fc-e09f6a238871",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "2f62c4e9-d022-4f6f-9974-bad934659e22",
              type: "RELATION",
              name: "messages",
              icon: "IconMessage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Messages",
              description: "Messages from the thread.",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "fe1d21fc-0f37-4cba-9297-2efaf38d047e",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "c3afbe81-489c-4aa2-bdee-b83beb407bc2",
                  nameSingular: "messageThread",
                  namePlural: "messageThreads"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "2f62c4e9-d022-4f6f-9974-bad934659e22",
                  name: "messages"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "c1eec93b-e57f-4ae5-b51c-d0c33d6a4c02",
                  nameSingular: "message",
                  namePlural: "messages"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "302dd589-5477-4f78-b145-3c7f74767023",
                  name: "messageThread"
                }
              }
            }
          ]
        }
      },
      {
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "c1eec93b-e57f-4ae5-b51c-d0c33d6a4c02",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "message",
          namePlural: "messages",
          icon: "IconMessage",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "029ea2ee-6ffe-45a5-93f2-85cefc83f019",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Message",
          labelPlural: "Messages",
          description: "A message sent or received through a messaging channel (email, chat, etc.)",
          fieldsList: [
            {
              __typename: "Field",
              id: "503fa159-ca14-49ee-8d02-7716c0349378",
              type: "TEXT",
              name: "headerMessageId",
              icon: "IconHash",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Header message Id",
              description: "Message id from the message header"
            },
            {
              __typename: "Field",
              id: "029ea2ee-6ffe-45a5-93f2-85cefc83f019",
              type: "TEXT",
              name: "subject",
              icon: "IconMessage",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Subject",
              description: "Subject"
            },
            {
              __typename: "Field",
              id: "545e3cf1-2760-4de4-9741-b3556e3827a9",
              type: "TEXT",
              name: "text",
              icon: "IconMessage",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Text",
              description: "Text"
            },
            {
              __typename: "Field",
              id: "30ce6760-cdbd-473f-9ee3-54bd2f849000",
              type: "DATE_TIME",
              name: "receivedAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Received At",
              description: "The date the message was received"
            },
            {
              __typename: "Field",
              id: "4208d8b5-8000-476f-9786-a3f668b8e333",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "c6626385-29d2-41b0-950b-68d6f9c64076",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "02f9e60e-84aa-4759-963f-8ef4530dbe47",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "2e114dfe-26be-47e5-9ffc-089d5ad53604",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "16011acb-d1fd-417c-b71f-b72fd32d157d",
              type: "UUID",
              name: "messageThreadId",
              icon: "IconHash",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Message Thread Id id (foreign key)",
              description: "Message Thread Id id foreign key"
            },
            {
              __typename: "Field",
              id: "302dd589-5477-4f78-b145-3c7f74767023",
              type: "RELATION",
              name: "messageThread",
              icon: "IconHash",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Message Thread Id",
              description: "Message Thread Id",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "fe1d21fc-0f37-4cba-9297-2efaf38d047e",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "c1eec93b-e57f-4ae5-b51c-d0c33d6a4c02",
                  nameSingular: "message",
                  namePlural: "messages"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "302dd589-5477-4f78-b145-3c7f74767023",
                  name: "messageThread"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "c3afbe81-489c-4aa2-bdee-b83beb407bc2",
                  nameSingular: "messageThread",
                  namePlural: "messageThreads"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "2f62c4e9-d022-4f6f-9974-bad934659e22",
                  name: "messages"
                }
              }
            },
            {
              __typename: "Field",
              id: "79a59047-dd05-4e8d-abb3-c9fda7bb1222",
              type: "RELATION",
              name: "messageParticipants",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Message Participants",
              description: "Message Participants",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "edd3a04a-b6f9-4b3f-9173-5e0b4a01c6fd",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "c1eec93b-e57f-4ae5-b51c-d0c33d6a4c02",
                  nameSingular: "message",
                  namePlural: "messages"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "79a59047-dd05-4e8d-abb3-c9fda7bb1222",
                  name: "messageParticipants"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "36411ed2-cbfe-44d4-bab6-52148d4d4485",
                  nameSingular: "messageParticipant",
                  namePlural: "messageParticipants"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "f94e6131-4976-405a-b570-0d9195624049",
                  name: "message"
                }
              }
            },
            {
              __typename: "Field",
              id: "7d197dab-8498-4e68-9fa2-ca3839fbd678",
              type: "RELATION",
              name: "messageChannelMessageAssociations",
              icon: "IconMessage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Message Channel Association",
              description: "Messages from the channel.",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "d723373b-8971-45fa-ab0a-94eca9c15b76",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "c1eec93b-e57f-4ae5-b51c-d0c33d6a4c02",
                  nameSingular: "message",
                  namePlural: "messages"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "7d197dab-8498-4e68-9fa2-ca3839fbd678",
                  name: "messageChannelMessageAssociations"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "01e5d86a-6039-400a-8004-d9058c5eb2c7",
                  nameSingular: "messageChannelMessageAssociation",
                  namePlural: "messageChannelMessageAssociations"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "0e3fa01d-bb7f-49d8-8f94-218120fabe70",
                  name: "message"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "2d8e46a1-bf8c-48d2-86df-21dd35e674f3",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_78fa73d661d632619e17de211e6",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "38f96d98-505e-4e34-bebf-9083a9bcb0f2",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "16011acb-d1fd-417c-b71f-b72fd32d157d"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "b73dc029-8c37-4353-be3b-a16245075f2c",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "viewFilterGroup",
          namePlural: "viewFilterGroups",
          icon: "IconFilterBolt",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "6572b4bf-c981-4db9-8f90-309522762cc2",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "View Filter Group",
          labelPlural: "View Filter Groups",
          description: "(System) View Filter Groups",
          fieldsList: [
            {
              __typename: "Field",
              id: "3708b84a-2364-4f6d-9aa8-6dd18b450485",
              type: "UUID",
              name: "parentViewFilterGroupId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Parent View Filter Group Id",
              description: "Parent View Filter Group"
            },
            {
              __typename: "Field",
              id: "504e55f6-6075-4284-b764-5aace1dee695",
              type: "SELECT",
              name: "logicalOperator",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'NOT'",
              options: [
                {
                  id: "5ccb8fe4-b069-4763-acf0-faa74dc003b1",
                  color: "blue",
                  label: "AND",
                  value: "AND",
                  position: 0
                },
                {
                  id: "91490634-455c-4943-8bea-0df927e33f9d",
                  color: "green",
                  label: "OR",
                  value: "OR",
                  position: 1
                },
                {
                  id: "dab9e60b-a2ac-4706-9acd-e167c246d3dd",
                  color: "red",
                  label: "NOT",
                  value: "NOT",
                  position: 2
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Logical Operator",
              description: "Logical operator for the filter group"
            },
            {
              __typename: "Field",
              id: "112d9259-6c51-4741-8f19-722d1e61305e",
              type: "POSITION",
              name: "positionInViewFilterGroup",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Position in view filter group",
              description: "Position in the parent view filter group"
            },
            {
              __typename: "Field",
              id: "6572b4bf-c981-4db9-8f90-309522762cc2",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "32524868-64b9-4d3f-97c9-abfc5bdaed97",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "876f5dc0-2205-44e8-add2-369fce3c4cad",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "658d2cac-e12b-4359-88e6-34155860da00",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "63b45122-054d-4b4e-991f-050ab94eb538",
              type: "UUID",
              name: "viewId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "View id (foreign key)",
              description: "View id foreign key"
            },
            {
              __typename: "Field",
              id: "33436639-0b6f-4285-85ad-1a8df491ba2a",
              type: "RELATION",
              name: "view",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "View",
              description: "View",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "37cf7abf-62b2-4ca1-8de1-f0d2e88c22fb",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "b73dc029-8c37-4353-be3b-a16245075f2c",
                  nameSingular: "viewFilterGroup",
                  namePlural: "viewFilterGroups"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "33436639-0b6f-4285-85ad-1a8df491ba2a",
                  name: "view"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "ded05363-70e6-4a88-95f3-ce04bb547dd2",
                  nameSingular: "view",
                  namePlural: "views"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "582631ee-0da9-45fd-83eb-35d9e74407c5",
                  name: "viewFilterGroups"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "66b53891-fda0-4f6f-adde-83618561aa5b",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_64ce6940a9464cd62484d52fb08",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "4d90ec0f-8dae-447b-ae7e-0a1d6c235eb7",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "63b45122-054d-4b4e-991f-050ab94eb538"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "96c8b3ad-828c-472c-8883-d4cf6e0a3704",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "658d2cac-e12b-4359-88e6-34155860da00"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "b488fc13-032b-434c-acc9-a1b1cd9ad0d1",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "attachment",
          namePlural: "attachments",
          icon: "IconFileImport",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "dba26a5c-e28a-46cc-b864-6e44ccc75cc7",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Attachment",
          labelPlural: "Attachments",
          description: "An attachment",
          fieldsList: [
            {
              __typename: "Field",
              id: "dba26a5c-e28a-46cc-b864-6e44ccc75cc7",
              type: "TEXT",
              name: "name",
              icon: "IconFileUpload",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Name",
              description: "Attachment name"
            },
            {
              __typename: "Field",
              id: "02de6b98-038f-4596-8be9-705aead1d862",
              type: "TEXT",
              name: "fullPath",
              icon: "IconLink",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Full path",
              description: "Attachment full path"
            },
            {
              __typename: "Field",
              id: "770805b1-bccc-4de0-95cc-842c9b3cf751",
              type: "TEXT",
              name: "type",
              icon: "IconList",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Type",
              description: "Attachment type"
            },
            {
              __typename: "Field",
              id: "07a2d361-02aa-4ae7-91e0-1ede7a03b6d7",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "d58d8759-28cd-4624-9a1f-931519e9ff93",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "943dfca6-d725-461f-bd48-a4477a5e56c8",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "f18cccbb-c28d-4780-ad00-d3e7ba18c029",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "ca51adde-f1bb-4900-b73d-21de269949f4",
              type: "UUID",
              name: "authorId",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Author id (foreign key)",
              description: "Attachment author id foreign key"
            },
            {
              __typename: "Field",
              id: "e938336b-1b26-47c4-8242-1a08f82a9ce6",
              type: "RELATION",
              name: "author",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Author",
              description: "Attachment author",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "cf957dc0-f40a-46db-8e3b-32e146127784",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "b488fc13-032b-434c-acc9-a1b1cd9ad0d1",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "e938336b-1b26-47c4-8242-1a08f82a9ce6",
                  name: "author"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "c841d49e-6664-4008-80bc-905c5540671e",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "99ee0445-5b57-418e-af33-8bcf11c1c55c",
                  name: "authoredAttachments"
                }
              }
            },
            {
              __typename: "Field",
              id: "1a104d61-5df6-4c0e-a309-c8281fbd97b4",
              type: "UUID",
              name: "taskId",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Task id (foreign key)",
              description: "Attachment task id foreign key"
            },
            {
              __typename: "Field",
              id: "4299edc2-6b91-4886-aeb7-5a1d0de8d689",
              type: "RELATION",
              name: "task",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Task",
              description: "Attachment task",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "2b5943b4-d59b-4956-90c6-ffab27f7f8da",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "b488fc13-032b-434c-acc9-a1b1cd9ad0d1",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "4299edc2-6b91-4886-aeb7-5a1d0de8d689",
                  name: "task"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "18ff5583-7593-422c-abea-ced0195e281d",
                  nameSingular: "task",
                  namePlural: "tasks"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "4e4e4d47-485a-48ac-9a4f-6fa085fbb527",
                  name: "attachments"
                }
              }
            },
            {
              __typename: "Field",
              id: "812419fd-f00c-49d8-b0e1-06c56370f73c",
              type: "UUID",
              name: "noteId",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Note id (foreign key)",
              description: "Attachment note id foreign key"
            },
            {
              __typename: "Field",
              id: "ef1388d8-4dad-42f2-93bb-59d817577917",
              type: "RELATION",
              name: "note",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Note",
              description: "Attachment note",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "8c6e551c-fab9-4646-94e5-bdca0050118a",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "b488fc13-032b-434c-acc9-a1b1cd9ad0d1",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "ef1388d8-4dad-42f2-93bb-59d817577917",
                  name: "note"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "cf1e3f15-1ce2-444b-9507-69eb7dc40972",
                  nameSingular: "note",
                  namePlural: "notes"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "010c6b85-9845-48b8-8636-91404383538c",
                  name: "attachments"
                }
              }
            },
            {
              __typename: "Field",
              id: "62a18fc9-3f0c-494b-9af3-66885e464220",
              type: "UUID",
              name: "personId",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Person id (foreign key)",
              description: "Attachment person id foreign key"
            },
            {
              __typename: "Field",
              id: "2f528146-253c-4080-9755-a09b1a7b4bb6",
              type: "RELATION",
              name: "person",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Person",
              description: "Attachment person",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "6a823e89-a5b7-4ec4-ae6e-9f3358af3c6b",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "b488fc13-032b-434c-acc9-a1b1cd9ad0d1",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "2f528146-253c-4080-9755-a09b1a7b4bb6",
                  name: "person"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "49029f5c-50d8-41e7-b58c-4584ee54763f",
                  nameSingular: "person",
                  namePlural: "people"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "e7394f4c-bf15-4205-b92e-c2be1bce1052",
                  name: "attachments"
                }
              }
            },
            {
              __typename: "Field",
              id: "b9d999ca-3c20-4e62-b731-1be9d227cfc4",
              type: "UUID",
              name: "companyId",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Company id (foreign key)",
              description: "Attachment company id foreign key"
            },
            {
              __typename: "Field",
              id: "401197af-856a-490a-bc7a-d8fa1b753568",
              type: "RELATION",
              name: "company",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Company",
              description: "Attachment company",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "ea7adf3b-7673-4cd6-9747-775023bf3c15",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "b488fc13-032b-434c-acc9-a1b1cd9ad0d1",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "401197af-856a-490a-bc7a-d8fa1b753568",
                  name: "company"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "d6742106-e3ac-4e28-95ad-0ae1f9f2c202",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "8cb39349-1e8d-49ca-b73a-195dd690ccaf",
                  name: "attachments"
                }
              }
            },
            {
              __typename: "Field",
              id: "63fe55df-31c4-4d94-a497-e5d2b3a72e2b",
              type: "UUID",
              name: "opportunityId",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Opportunity id (foreign key)",
              description: "Attachment opportunity id foreign key"
            },
            {
              __typename: "Field",
              id: "80955397-e206-49d8-a745-00ddc96ca76e",
              type: "RELATION",
              name: "opportunity",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Opportunity",
              description: "Attachment opportunity",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "b1a221bc-9192-4ba6-ad06-2bfdf8e173f3",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "b488fc13-032b-434c-acc9-a1b1cd9ad0d1",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "80955397-e206-49d8-a745-00ddc96ca76e",
                  name: "opportunity"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "4afa7501-4bd9-4ec7-bd07-ce6f69ad0d98",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "946569ff-dbe3-4635-a38b-5e744d88e359",
                  name: "attachments"
                }
              }
            },
            {
              __typename: "Field",
              id: "556e779d-fb1a-4bb7-80ab-fc80035b4933",
              type: "RELATION",
              name: "pet",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.335Z",
              updatedAt: "2025-02-11T09:14:39.335Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Pet",
              description: "Attachments Pet",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "f61c9590-f432-4df8-90d0-98b2ad23ece5",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "b488fc13-032b-434c-acc9-a1b1cd9ad0d1",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "556e779d-fb1a-4bb7-80ab-fc80035b4933",
                  name: "pet"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "055c2349-c786-4389-b09d-09c89fc131bc",
                  nameSingular: "pet",
                  namePlural: "pets"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "24feadce-321d-4192-9060-3879a0d27b23",
                  name: "attachments"
                }
              }
            },
            {
              __typename: "Field",
              id: "7e3567a8-ddee-4bdd-88a0-65a99c556301",
              type: "UUID",
              name: "petId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.335Z",
              updatedAt: "2025-02-11T09:14:39.335Z",
              defaultValue: null,
              options: null,
              settings: {
                isForeignKey: true
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Pet ID (foreign key)",
              description: "Attachment Pet id foreign key"
            },
            {
              __typename: "Field",
              id: "33f6f21c-70fb-4952-a81b-7a9a0652e273",
              type: "RELATION",
              name: "surveyResult",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.051Z",
              updatedAt: "2025-02-11T09:14:40.051Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Survey result",
              description: "Attachments Survey result",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "f8718732-b97f-478e-b748-f6854ca59f8a",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "b488fc13-032b-434c-acc9-a1b1cd9ad0d1",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "33f6f21c-70fb-4952-a81b-7a9a0652e273",
                  name: "surveyResult"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "3433f66e-e32c-4b99-b48b-38e6d23501cc",
                  nameSingular: "surveyResult",
                  namePlural: "surveyResults"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "5082fea5-d4a1-4ff2-adfc-9f2ed99d958a",
                  name: "attachments"
                }
              }
            },
            {
              __typename: "Field",
              id: "eebed9e6-8a1c-4f5a-8151-c515f96b433a",
              type: "UUID",
              name: "surveyResultId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.051Z",
              updatedAt: "2025-02-11T09:14:40.051Z",
              defaultValue: null,
              options: null,
              settings: {
                isForeignKey: true
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Survey result ID (foreign key)",
              description: "Attachment Survey result id foreign key"
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "30cc287f-a69d-4ed2-b1c5-bc05971e16bd",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_73615a6bdc972b013956b19c59e",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: []
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "49ae070b-994c-4cc8-a7f5-d1931f80183e",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_30f969e0ec549acca94396d3efe",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "eb936866-c7d7-472b-8338-56d08ac01828",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "f18cccbb-c28d-4780-ad00-d3e7ba18c029"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "ccb711f0-4564-4446-927c-b64411d0ca2d",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_3ca1d5243ff67f58c7c65c9a8a2",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "184f1837-0f69-43b7-97dc-672fa40da955",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "f18cccbb-c28d-4780-ad00-d3e7ba18c029"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "354a225d-5af9-4c04-95a7-c79a7818e9f4",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "62a18fc9-3f0c-494b-9af3-66885e464220"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "0fba0409-8b24-4eb5-959b-939b57caa7d6",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_91e687ea21123af4e02c9a07a43",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "d413f019-107b-4dcd-afb8-51c6b4e4c33b",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "b9d999ca-3c20-4e62-b731-1be9d227cfc4"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "ae679df1-6528-4abf-be6f-4ee281eff3d9",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "f18cccbb-c28d-4780-ad00-d3e7ba18c029"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "48c5176d-2969-4632-897a-48aba817dcc8",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_0698fed0e67005b7051b5d353b6",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: []
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "2bd6a14b-f653-444d-85a3-e4537912383c",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_2055e4e583e9a2e5b4c239fd992",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "d69ee803-1023-41e2-b662-d7a5ce06d2e3",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "f18cccbb-c28d-4780-ad00-d3e7ba18c029"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "6d8336f2-2c39-400f-8913-82b27b9df5e5",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "1a104d61-5df6-4c0e-a309-c8281fbd97b4"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "b485f8cb-1d75-4afa-82c5-39bf8c2887cb",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "webhook",
          namePlural: "webhooks",
          icon: "IconRobot",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "cbf8a777-7bea-4fc6-94e5-a5183bc5567b",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Webhook",
          labelPlural: "Webhooks",
          description: "A webhook",
          fieldsList: [
            {
              __typename: "Field",
              id: "cbf8a777-7bea-4fc6-94e5-a5183bc5567b",
              type: "TEXT",
              name: "targetUrl",
              icon: "IconLink",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Target Url",
              description: "Webhook target url"
            },
            {
              __typename: "Field",
              id: "20f3c6b7-5ab7-4791-8bda-43a85a3db66d",
              type: "ARRAY",
              name: "operations",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: [
                "*.*"
              ],
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Operations",
              description: "Webhook operations"
            },
            {
              __typename: "Field",
              id: "ec9401a6-1fad-4047-b3f5-1cf46f82c5dd",
              type: "TEXT",
              name: "description",
              icon: "IconInfo",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Description",
              description: ""
            },
            {
              __typename: "Field",
              id: "8f5cc630-ec73-44ee-902f-d7f297755ee6",
              type: "TEXT",
              name: "secret",
              icon: "IconLock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Secret",
              description: "Optional secret used to compute the HMAC signature for webhook payloads. This secret is shared between Twenty and the webhook consumer to authenticate webhook requests."
            },
            {
              __typename: "Field",
              id: "29c5f48a-480f-4a17-91ef-c332395c73aa",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "3fba04dd-15d3-4126-9886-13c5ff298d12",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "051bcb98-16f4-42ac-b800-4a89f3088b7c",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "fe4a19c3-ad76-49eb-bc97-88b82eb31923",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: []
          }
        }
      },
      {
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "b38a7efd-b472-4b8e-8988-2b3fab3fe67f",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "workflowVersion",
          namePlural: "workflowVersions",
          icon: "IconSettingsAutomation",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: false,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "f5dbede2-acbb-43b9-82a0-c7bff8155a3f",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Workflow Version",
          labelPlural: "Workflow Versions",
          description: "A workflow version",
          fieldsList: [
            {
              __typename: "Field",
              id: "f5dbede2-acbb-43b9-82a0-c7bff8155a3f",
              type: "TEXT",
              name: "name",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Name",
              description: "The workflow version name"
            },
            {
              __typename: "Field",
              id: "7cda109d-6ac9-4f43-a796-d445c4ef828f",
              type: "RAW_JSON",
              name: "trigger",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Version trigger",
              description: "Json object to provide trigger"
            },
            {
              __typename: "Field",
              id: "0a06969d-5da2-4e58-ba17-0add32dba858",
              type: "RAW_JSON",
              name: "steps",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Version steps",
              description: "Json object to provide steps"
            },
            {
              __typename: "Field",
              id: "dc9c2e26-2946-4b71-8705-fcf4896f99bc",
              type: "SELECT",
              name: "status",
              icon: "IconStatusChange",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'DRAFT'",
              options: [
                {
                  id: "073f3f71-a2a4-49be-b136-5862a2cf505b",
                  color: "yellow",
                  label: "Draft",
                  value: "DRAFT",
                  position: 0
                },
                {
                  id: "0e25e22c-1c47-4ee7-b78b-7a0129580227",
                  color: "green",
                  label: "Active",
                  value: "ACTIVE",
                  position: 1
                },
                {
                  id: "1dd5b2e6-d5f9-4fda-ac4e-d65b30c6e6da",
                  color: "orange",
                  label: "Deactivated",
                  value: "DEACTIVATED",
                  position: 2
                },
                {
                  id: "ffb6f400-2798-439a-9548-61b4dc3c2f72",
                  color: "gray",
                  label: "Archived",
                  value: "ARCHIVED",
                  position: 3
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Version status",
              description: "The workflow version status"
            },
            {
              __typename: "Field",
              id: "521d81f4-8a36-42d5-aadb-5b5d1f9a385a",
              type: "POSITION",
              name: "position",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Position",
              description: "Workflow version position"
            },
            {
              __typename: "Field",
              id: "db51d6e7-2bff-4448-969f-d4e6f72bd9b7",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "ed2658ba-e06c-423d-a601-de3415280845",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "ea33717a-7d0c-477a-87ee-298478d643a9",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "3f7a799a-f871-4657-9c27-1aa27f1f3cea",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "3a44f340-719b-48d2-91af-30bf4c092e55",
              type: "UUID",
              name: "workflowId",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Workflow id (foreign key)",
              description: "WorkflowVersion workflow id foreign key"
            },
            {
              __typename: "Field",
              id: "b0ce1277-33e5-4375-884f-d0ec4d13aeb4",
              type: "RELATION",
              name: "workflow",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Workflow",
              description: "WorkflowVersion workflow",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "3444601d-b206-4ce6-9678-8dd284bc5b57",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "b38a7efd-b472-4b8e-8988-2b3fab3fe67f",
                  nameSingular: "workflowVersion",
                  namePlural: "workflowVersions"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "b0ce1277-33e5-4375-884f-d0ec4d13aeb4",
                  name: "workflow"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "18d91fb4-c535-425e-8ff7-fb68394dfbf5",
                  nameSingular: "workflow",
                  namePlural: "workflows"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "a3509a8d-887a-4dc2-a90a-901e6815ba6c",
                  name: "versions"
                }
              }
            },
            {
              __typename: "Field",
              id: "4a89f0cb-39b3-4532-94e7-b23bc35ef64f",
              type: "RELATION",
              name: "runs",
              icon: "IconRun",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Runs",
              description: "Workflow runs linked to the version.",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "2d165a9b-3699-45fa-98cc-b9af92af5c51",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "b38a7efd-b472-4b8e-8988-2b3fab3fe67f",
                  nameSingular: "workflowVersion",
                  namePlural: "workflowVersions"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "4a89f0cb-39b3-4532-94e7-b23bc35ef64f",
                  name: "runs"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "16c29a47-a565-4f4b-90c4-f1b52a32f234",
                  nameSingular: "workflowRun",
                  namePlural: "workflowRuns"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "dc394218-f576-42aa-8727-c4182de7f4a0",
                  name: "workflowVersion"
                }
              }
            },
            {
              __typename: "Field",
              id: "0ab646a0-e40e-465a-9a8e-31c7d733ebe0",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Favorites",
              description: "Favorites linked to the workflow version",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "86d90951-1389-43a6-82b2-e06796f9c041",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "b38a7efd-b472-4b8e-8988-2b3fab3fe67f",
                  nameSingular: "workflowVersion",
                  namePlural: "workflowVersions"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "0ab646a0-e40e-465a-9a8e-31c7d733ebe0",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "76671851-284f-494a-97dd-9fa6412c4a2d",
                  name: "workflowVersion"
                }
              }
            },
            {
              __typename: "Field",
              id: "2f0d7a15-4962-4d8e-a30b-c70f0b5e23b7",
              type: "RELATION",
              name: "timelineActivities",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Timeline Activities",
              description: "Timeline activities linked to the version",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "db389c46-c137-406a-8525-bf5229d25be1",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "b38a7efd-b472-4b8e-8988-2b3fab3fe67f",
                  nameSingular: "workflowVersion",
                  namePlural: "workflowVersions"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "2f0d7a15-4962-4d8e-a30b-c70f0b5e23b7",
                  name: "timelineActivities"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "417786ec-7358-4019-b72b-6002551ed5e8",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "e1d95b52-550a-465b-8e43-324bf25c6958",
                  name: "workflowVersion"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "c85749e7-e25d-4a8d-be53-69901681e48e",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_a362c5eff4a28fcdffdd3bdff16",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: []
                  }
                }
              }
            ]
          }
        }
      },
      {
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "b21d7735-22be-4a25-af4c-b33157e07a90",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "blocklist",
          namePlural: "blocklists",
          icon: "IconForbid2",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "1d9070ea-776b-4a86-b5ec-08f57d84a87d",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Blocklist",
          labelPlural: "Blocklists",
          description: "Blocklist",
          fieldsList: [
            {
              __typename: "Field",
              id: "1d9070ea-776b-4a86-b5ec-08f57d84a87d",
              type: "TEXT",
              name: "handle",
              icon: "IconAt",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Handle",
              description: "Handle"
            },
            {
              __typename: "Field",
              id: "78eb17f6-bb47-406c-a343-6265de3d78eb",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "6c67a649-15c3-46d4-a886-f99ea6f8b9ae",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "9c31c912-975c-4434-b9e4-780824106b0d",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "9292a8aa-96b8-4e3d-8b4b-46d02a379f94",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "dd7abd0e-fb7a-44b5-b445-a886451da34f",
              type: "UUID",
              name: "forWorkspaceMemberId",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "WorkspaceMember id (foreign key)",
              description: "WorkspaceMember id foreign key"
            },
            {
              __typename: "Field",
              id: "b37d7cda-7edd-4fb7-8443-4cb60d16bfa5",
              type: "RELATION",
              name: "forWorkspaceMember",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "WorkspaceMember",
              description: "WorkspaceMember",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "43b47587-ad44-4259-9eb0-bae019e2f142",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "b21d7735-22be-4a25-af4c-b33157e07a90",
                  nameSingular: "blocklist",
                  namePlural: "blocklists"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "b37d7cda-7edd-4fb7-8443-4cb60d16bfa5",
                  name: "workspaceMember"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "c841d49e-6664-4008-80bc-905c5540671e",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "1b92ad62-0000-47cf-b91d-3293993f8e9c",
                  name: "blocklist"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "46c42be0-d362-4197-a0dd-60fa31220106",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_76a190ab8a6f439791358d63d60",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "0a8015bf-417c-4bd8-8bb1-d0b5bc65b5b8",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "9292a8aa-96b8-4e3d-8b4b-46d02a379f94"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "a17de606-2548-4e28-b935-da55923f299d",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "dd7abd0e-fb7a-44b5-b445-a886451da34f"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "aef9c77c-0623-4d60-adb6-1aaa3e07538f",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "calendarChannelEventAssociation",
          namePlural: "calendarChannelEventAssociations",
          icon: "IconCalendar",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "c8e0cf61-e509-4019-82a4-41482cb9f875",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Calendar Channel Event Association",
          labelPlural: "Calendar Channel Event Associations",
          description: "Calendar Channel Event Associations",
          fieldsList: [
            {
              __typename: "Field",
              id: "824cc77a-aeba-406b-b39b-654f5b4bfa67",
              type: "TEXT",
              name: "eventExternalId",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Event external ID",
              description: "Event external ID"
            },
            {
              __typename: "Field",
              id: "0ee885c4-c264-4e03-af20-2663ecca753e",
              type: "TEXT",
              name: "recurringEventExternalId",
              icon: "IconHistory",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Recurring Event ID",
              description: "Recurring Event ID"
            },
            {
              __typename: "Field",
              id: "c8e0cf61-e509-4019-82a4-41482cb9f875",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "f61dfb7b-55f4-4892-b918-80b58b7551e6",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "5943bc69-ecfe-4180-a38d-6631bb3050bf",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "b667d27f-7ec8-4770-8f96-b639ddf0e260",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "64dc2411-cae8-43b8-9077-d6c846fd4095",
              type: "UUID",
              name: "calendarChannelId",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Channel ID id (foreign key)",
              description: "Channel ID id foreign key"
            },
            {
              __typename: "Field",
              id: "30a2da43-02a3-4648-851f-65d4ad841515",
              type: "RELATION",
              name: "calendarChannel",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Channel ID",
              description: "Channel ID",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "c19cd272-8d34-40ea-a369-d6bd63bad394",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "aef9c77c-0623-4d60-adb6-1aaa3e07538f",
                  nameSingular: "calendarChannelEventAssociation",
                  namePlural: "calendarChannelEventAssociations"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "30a2da43-02a3-4648-851f-65d4ad841515",
                  name: "calendarChannel"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "5b44308a-da32-447e-b210-bf52f1230689",
                  nameSingular: "calendarChannel",
                  namePlural: "calendarChannels"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "fe5e6a90-6cd8-4eaf-9c42-7316c01c5c73",
                  name: "calendarChannelEventAssociations"
                }
              }
            },
            {
              __typename: "Field",
              id: "ca426f47-4920-4600-ab36-0b5869101867",
              type: "UUID",
              name: "calendarEventId",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Event ID id (foreign key)",
              description: "Event ID id foreign key"
            },
            {
              __typename: "Field",
              id: "34bcd5d2-bd75-49d2-b1f2-c5aa9e377e11",
              type: "RELATION",
              name: "calendarEvent",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Event ID",
              description: "Event ID",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "50eb0856-11b5-4b7f-8f63-a60685e9ff33",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "aef9c77c-0623-4d60-adb6-1aaa3e07538f",
                  nameSingular: "calendarChannelEventAssociation",
                  namePlural: "calendarChannelEventAssociations"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "34bcd5d2-bd75-49d2-b1f2-c5aa9e377e11",
                  name: "calendarEvent"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "e327588e-09dd-445f-b7b3-28b707beb1fe",
                  nameSingular: "calendarEvent",
                  namePlural: "calendarEvents"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "6626ca4a-91cc-4483-a9c4-1eefdecf5ea9",
                  name: "calendarChannelEventAssociations"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "990d940c-4e9c-4efd-876b-d4679e1db9be",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_a88c3ab301c25202d4b52fb4b1b",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "9f8fc867-e232-47fd-a320-812b46c5dc56",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "64dc2411-cae8-43b8-9077-d6c846fd4095"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "4239decf-5fbf-4cd2-96ae-aace8116b6cf",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_92a888b681107c4f78926820db7",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "11eb1ed3-1712-449e-a710-054e2f4952dc",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "ca426f47-4920-4600-ab36-0b5869101867"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "506c20b5-ca47-40f3-b638-787f8ef2a448",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "b667d27f-7ec8-4770-8f96-b639ddf0e260"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "a9f0f54b-b691-4133-9136-f25639f05b22",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "favoriteFolder",
          namePlural: "favoriteFolders",
          icon: "IconFolder",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "a74894a3-4065-4b87-ab17-3252c709235b",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Favorite Folder",
          labelPlural: "Favorite Folders",
          description: "A Folder of favorites",
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: []
          },
          fieldsList: [
            {
              __typename: "Field",
              id: "4595740d-e52f-4ae3-a91c-afdf52c479d4",
              type: "NUMBER",
              name: "position",
              icon: "IconList",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Position",
              description: "Favorite folder position"
            },
            {
              __typename: "Field",
              id: "70dd01e7-a4b8-4f3d-b95f-b2d8dc1c2dee",
              type: "TEXT",
              name: "name",
              icon: "IconText",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Name",
              description: "Name of the favorite folder"
            },
            {
              __typename: "Field",
              id: "a74894a3-4065-4b87-ab17-3252c709235b",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "2ba001f1-d9a0-4efd-9667-e64350a03caf",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "ebf50c63-af18-4140-88ad-4b5a84dbeb86",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "5c6532d1-f8d5-43b4-ada6-96904a1c3240",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "59894c72-b8fe-46fe-b8c2-a94c4bda624a",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Favorites",
              description: "Favorites in this folder",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "5f946751-d767-453b-bfd4-0b98a58c6df2",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "a9f0f54b-b691-4133-9136-f25639f05b22",
                  nameSingular: "favoriteFolder",
                  namePlural: "favoriteFolders"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "59894c72-b8fe-46fe-b8c2-a94c4bda624a",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "afff7566-c70e-4174-ac4b-33229188d303",
                  name: "favoriteFolder"
                }
              }
            }
          ]
        }
      },
      {
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "favorite",
          namePlural: "favorites",
          icon: "IconHeart",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "7a9d535e-6665-4de0-a301-d3ffaf94e1fb",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Favorite",
          labelPlural: "Favorites",
          description: "A favorite that can be accessed from the left menu",
          fieldsList: [
            {
              __typename: "Field",
              id: "109d9afd-36b8-4729-b89c-a9ea25d81f2a",
              type: "NUMBER",
              name: "position",
              icon: "IconList",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Position",
              description: "Favorite position"
            },
            {
              __typename: "Field",
              id: "7a9d535e-6665-4de0-a301-d3ffaf94e1fb",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "e8a51874-e145-468a-937a-eacaf77a7e4a",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "7df98730-ae0c-4579-b882-011cbfcab0f3",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "a584f42b-a89b-49e2-bcfd-acc88fbdf652",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "d138fd97-afec-4b74-9f61-5932fde251b4",
              type: "UUID",
              name: "forWorkspaceMemberId",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Workspace Member id (foreign key)",
              description: "Favorite workspace member id foreign key"
            },
            {
              __typename: "Field",
              id: "0447657b-e2a8-4f8b-ad9b-aa9509ac0ac2",
              type: "RELATION",
              name: "forWorkspaceMember",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Workspace Member",
              description: "Favorite workspace member",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "68b577d8-35aa-4e4f-8c3c-9010e82b174d",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "0447657b-e2a8-4f8b-ad9b-aa9509ac0ac2",
                  name: "forWorkspaceMember"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "c841d49e-6664-4008-80bc-905c5540671e",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "2a1f9f54-408d-49b7-8a90-0145828e6fe4",
                  name: "favorites"
                }
              }
            },
            {
              __typename: "Field",
              id: "d02aebbc-bef2-451d-a36d-6dfbcb66c1f6",
              type: "UUID",
              name: "personId",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Person id (foreign key)",
              description: "Favorite person id foreign key"
            },
            {
              __typename: "Field",
              id: "b62541e3-04a0-4569-907d-1eeaf498d296",
              type: "RELATION",
              name: "person",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Person",
              description: "Favorite person",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "4fff0ed3-ec08-4b53-86bf-2bc3bad9fde3",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "b62541e3-04a0-4569-907d-1eeaf498d296",
                  name: "person"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "49029f5c-50d8-41e7-b58c-4584ee54763f",
                  nameSingular: "person",
                  namePlural: "people"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "7d26908d-2099-40fe-b83e-64414ceb5b6a",
                  name: "favorites"
                }
              }
            },
            {
              __typename: "Field",
              id: "5df6b15b-ca48-4860-b17f-24559e2053e4",
              type: "UUID",
              name: "companyId",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Company id (foreign key)",
              description: "Favorite company id foreign key"
            },
            {
              __typename: "Field",
              id: "747f73c5-1cdc-4601-99cc-2adfbf7595dd",
              type: "RELATION",
              name: "company",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Company",
              description: "Favorite company",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "5cab401b-8f5c-4633-b7c0-29c3fc4069f4",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "747f73c5-1cdc-4601-99cc-2adfbf7595dd",
                  name: "company"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "d6742106-e3ac-4e28-95ad-0ae1f9f2c202",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "6c7f1423-f979-450f-9d27-ac52e0462d4d",
                  name: "favorites"
                }
              }
            },
            {
              __typename: "Field",
              id: "5dac020c-2efc-4787-8060-e30e0244bd85",
              type: "UUID",
              name: "favoriteFolderId",
              icon: "IconFolder",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Favorite Folder id (foreign key)",
              description: "The folder this favorite belongs to id foreign key"
            },
            {
              __typename: "Field",
              id: "afff7566-c70e-4174-ac4b-33229188d303",
              type: "RELATION",
              name: "favoriteFolder",
              icon: "IconFolder",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Favorite Folder",
              description: "The folder this favorite belongs to",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "5f946751-d767-453b-bfd4-0b98a58c6df2",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "afff7566-c70e-4174-ac4b-33229188d303",
                  name: "favoriteFolder"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "a9f0f54b-b691-4133-9136-f25639f05b22",
                  nameSingular: "favoriteFolder",
                  namePlural: "favoriteFolders"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "59894c72-b8fe-46fe-b8c2-a94c4bda624a",
                  name: "favorites"
                }
              }
            },
            {
              __typename: "Field",
              id: "d9a8eae4-3119-4528-9497-e0c6a80b3216",
              type: "UUID",
              name: "opportunityId",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Opportunity id (foreign key)",
              description: "Favorite opportunity id foreign key"
            },
            {
              __typename: "Field",
              id: "56d7cf1f-1d98-42d3-a89b-e35310615f69",
              type: "RELATION",
              name: "opportunity",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Opportunity",
              description: "Favorite opportunity",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "9581c75b-3a72-497f-a007-490e040b1762",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "56d7cf1f-1d98-42d3-a89b-e35310615f69",
                  name: "opportunity"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "4afa7501-4bd9-4ec7-bd07-ce6f69ad0d98",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "897c675f-511b-47b5-a86b-21a9ebf28403",
                  name: "favorites"
                }
              }
            },
            {
              __typename: "Field",
              id: "5aa42208-b72d-4f54-a952-4627e37a5896",
              type: "UUID",
              name: "workflowId",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Workflow id (foreign key)",
              description: "Favorite workflow id foreign key"
            },
            {
              __typename: "Field",
              id: "a0e396c3-a8cd-4934-82bc-7443862b4760",
              type: "RELATION",
              name: "workflow",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Workflow",
              description: "Favorite workflow",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "81d32c05-6ca9-494f-a509-195868f7a492",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "a0e396c3-a8cd-4934-82bc-7443862b4760",
                  name: "workflow"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "18d91fb4-c535-425e-8ff7-fb68394dfbf5",
                  nameSingular: "workflow",
                  namePlural: "workflows"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "8a0f832b-bf17-4d66-8a44-e835c4d2030b",
                  name: "favorites"
                }
              }
            },
            {
              __typename: "Field",
              id: "570b23a8-c9d1-428b-93fd-ef98788f3163",
              type: "UUID",
              name: "workflowVersionId",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Workflow id (foreign key)",
              description: "Favorite workflow version id foreign key"
            },
            {
              __typename: "Field",
              id: "76671851-284f-494a-97dd-9fa6412c4a2d",
              type: "RELATION",
              name: "workflowVersion",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Workflow",
              description: "Favorite workflow version",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "86d90951-1389-43a6-82b2-e06796f9c041",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "76671851-284f-494a-97dd-9fa6412c4a2d",
                  name: "workflowVersion"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "b38a7efd-b472-4b8e-8988-2b3fab3fe67f",
                  nameSingular: "workflowVersion",
                  namePlural: "workflowVersions"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "0ab646a0-e40e-465a-9a8e-31c7d733ebe0",
                  name: "favorites"
                }
              }
            },
            {
              __typename: "Field",
              id: "8e0d98c2-a278-4c00-91ba-6499db73b6df",
              type: "UUID",
              name: "workflowRunId",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Workflow id (foreign key)",
              description: "Favorite workflow run id foreign key"
            },
            {
              __typename: "Field",
              id: "8d10d3da-66df-4cec-b165-1a83b80bb2f5",
              type: "RELATION",
              name: "workflowRun",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Workflow",
              description: "Favorite workflow run",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "7bca5b31-61c6-4247-86cf-3eea0761f52d",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "8d10d3da-66df-4cec-b165-1a83b80bb2f5",
                  name: "workflowRun"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "16c29a47-a565-4f4b-90c4-f1b52a32f234",
                  nameSingular: "workflowRun",
                  namePlural: "workflowRuns"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "d0c9aa4a-6e28-4dc6-9892-a121d8f1d025",
                  name: "favorites"
                }
              }
            },
            {
              __typename: "Field",
              id: "f36e9ff5-fc41-43fa-80ce-7217e98bf365",
              type: "UUID",
              name: "taskId",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Task id (foreign key)",
              description: "Favorite task id foreign key"
            },
            {
              __typename: "Field",
              id: "d784ae0c-6262-43d7-9c26-da96b3e0d12f",
              type: "RELATION",
              name: "task",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Task",
              description: "Favorite task",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "ce24ceea-a777-4728-9a39-22595aed4142",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "d784ae0c-6262-43d7-9c26-da96b3e0d12f",
                  name: "task"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "18ff5583-7593-422c-abea-ced0195e281d",
                  nameSingular: "task",
                  namePlural: "tasks"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "84949de2-f936-4623-9764-5ce4ed1274db",
                  name: "favorites"
                }
              }
            },
            {
              __typename: "Field",
              id: "89f3d125-017f-47a1-898a-d808e9e3e370",
              type: "UUID",
              name: "noteId",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Note id (foreign key)",
              description: "Favorite note id foreign key"
            },
            {
              __typename: "Field",
              id: "ffd3df52-6009-4eb4-9357-04c11f7d2cac",
              type: "RELATION",
              name: "note",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Note",
              description: "Favorite note",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "b3ed12e9-211f-406e-9e1b-1928077bd170",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "ffd3df52-6009-4eb4-9357-04c11f7d2cac",
                  name: "note"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "cf1e3f15-1ce2-444b-9507-69eb7dc40972",
                  nameSingular: "note",
                  namePlural: "notes"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "f357864e-28bf-4ea3-b8b6-11610791b673",
                  name: "favorites"
                }
              }
            },
            {
              __typename: "Field",
              id: "616c9159-b594-4071-ac42-5bb79695a05f",
              type: "UUID",
              name: "viewId",
              icon: "IconLayoutCollage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "View id (foreign key)",
              description: "Favorite view id foreign key"
            },
            {
              __typename: "Field",
              id: "7a529e4f-5458-4f8e-814e-9c0b283e2365",
              type: "RELATION",
              name: "view",
              icon: "IconLayoutCollage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "View",
              description: "Favorite view",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "6a6dd17e-d29a-4c79-a52a-e571072d222f",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "7a529e4f-5458-4f8e-814e-9c0b283e2365",
                  name: "view"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "ded05363-70e6-4a88-95f3-ce04bb547dd2",
                  nameSingular: "view",
                  namePlural: "views"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "6a6563c4-98dd-4400-bba6-e5c8a93a0d5f",
                  name: "favorites"
                }
              }
            },
            {
              __typename: "Field",
              id: "c081018d-9287-4bce-9b14-75b47b6ef6a4",
              type: "RELATION",
              name: "surveyResult",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.051Z",
              updatedAt: "2025-02-11T09:14:40.051Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Survey result",
              description: "Favorites Survey result",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "232846d1-ca1e-41a4-97a3-fdf6431aa572",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "c081018d-9287-4bce-9b14-75b47b6ef6a4",
                  name: "surveyResult"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "3433f66e-e32c-4b99-b48b-38e6d23501cc",
                  nameSingular: "surveyResult",
                  namePlural: "surveyResults"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "b5f3ac59-dc01-4f51-a9b8-d921adecb78d",
                  name: "favorites"
                }
              }
            },
            {
              __typename: "Field",
              id: "0f4a5eb7-9214-4da3-a283-886b09a48b57",
              type: "UUID",
              name: "surveyResultId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.051Z",
              updatedAt: "2025-02-11T09:14:40.051Z",
              defaultValue: null,
              options: null,
              settings: {
                isForeignKey: true
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Survey result ID (foreign key)",
              description: "Favorite Survey result id foreign key"
            },
            {
              __typename: "Field",
              id: "db1a3dd5-0f72-4c6b-a8e3-91956ba6421e",
              type: "RELATION",
              name: "pet",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.335Z",
              updatedAt: "2025-02-11T09:14:39.335Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Pet",
              description: "Favorites Pet",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "08f93709-2e7e-4878-9a5e-e4f1e67b0a3b",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "db1a3dd5-0f72-4c6b-a8e3-91956ba6421e",
                  name: "pet"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "055c2349-c786-4389-b09d-09c89fc131bc",
                  nameSingular: "pet",
                  namePlural: "pets"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "5a595ace-7c91-4740-ab7c-e2b1b66d489e",
                  name: "favorites"
                }
              }
            },
            {
              __typename: "Field",
              id: "28c5019e-01fd-468d-810f-864827d848e7",
              type: "UUID",
              name: "petId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.335Z",
              updatedAt: "2025-02-11T09:14:39.335Z",
              defaultValue: null,
              options: null,
              settings: {
                isForeignKey: true
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Pet ID (foreign key)",
              description: "Favorite Pet id foreign key"
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "630a29e8-65b4-45d4-8967-e9671a9dd97e",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_7c59b29a053016fc596ddad8a0e",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "b85d8e74-79c1-4f9c-95cc-cf87d0c7eb7d",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "a584f42b-a89b-49e2-bcfd-acc88fbdf652"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "41270dc4-edff-444e-b7e0-1eb18170e9ab",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "8e0d98c2-a278-4c00-91ba-6499db73b6df"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "1e5e52dd-6c9c-44e4-b480-dc6521d0e823",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_eecddc968e93b9b8ebbfd85dad3",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "65906849-0fd9-40dc-8684-41ec840b76c9",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "5aa42208-b72d-4f54-a952-4627e37a5896"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "1db81318-ee36-41fe-8006-7c129ae44a48",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "a584f42b-a89b-49e2-bcfd-acc88fbdf652"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "6220fc00-1229-4426-861b-df9463c0a3da",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_b810a8e37adf5cafd342170ccf8",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "99a24e03-0200-4b9c-98ba-53fca9894e78",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "5dac020c-2efc-4787-8060-e30e0244bd85"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "49222987-099e-4167-b197-03223565b05b",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_85f024f9ec673d530d14cf75fe5",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "93db2e51-8f42-4d17-8ddf-6de339e977ec",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "d9a8eae4-3119-4528-9497-e0c6a80b3216"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "57e55254-b0c2-4c9e-b290-fe353d19054c",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_e14b3424016bea8b7fe220f7761",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "128c8d8a-eb5d-42f2-a009-2e995a740f1f",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "f36e9ff5-fc41-43fa-80ce-7217e98bf365"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "32a1f875-0d25-48f8-b5fe-3959bac523e3",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_1f7e4cb168e77496349c8cefed6",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "5df647e0-0213-46e4-8a35-550924067442",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "a584f42b-a89b-49e2-bcfd-acc88fbdf652"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "4ff4b4a1-70f6-437a-88cf-123fb5da5c03",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "d02aebbc-bef2-451d-a36d-6dfbcb66c1f6"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "ceaf7578-32cd-401a-90f6-789ee118a201",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_21d905e0adf19e835f6059a9f3d",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "cc1231bc-c88f-4526-9e07-89f560d79877",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "89f3d125-017f-47a1-898a-d808e9e3e370"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "99874d8d-bfff-42af-bb8b-dc4ae1d78e03",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_c3ee83d51bc99ba99fe1998c508",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "3b96a079-428c-4025-9f59-d3dc633c0623",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "d138fd97-afec-4b74-9f61-5932fde251b4"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "cf1da84a-0d11-4773-9f37-41910e50fda1",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "a584f42b-a89b-49e2-bcfd-acc88fbdf652"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "34e296e1-33b9-43e8-9950-2d06c8263eef",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_110d1dc7f0ecd231a18f6784cf3",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: []
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "7e738b5d-d177-4d7b-a129-b87e7aa56ccc",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_505a1fccd2804f2472bd92e8720",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "bbc258ca-ab3d-4aed-9417-d541c513080c",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "616c9159-b594-4071-ac42-5bb79695a05f"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "989f25f8-015f-43dc-b39c-dac5a5281fa8",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_a900d9f809273abe54dc5e166fa",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "2f4407cd-aea1-4aba-9c86-4f95ff01b7bc",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "a584f42b-a89b-49e2-bcfd-acc88fbdf652"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "1e731593-a7bc-406f-97c0-4763770aee6d",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "5df6b15b-ca48-4860-b17f-24559e2053e4"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "91b99843-10ae-412e-b482-bd5691a18b90",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "viewGroup",
          namePlural: "viewGroups",
          icon: "IconTag",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "b3df551f-1afb-4a2b-b899-3b49d111b16b",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "View Group",
          labelPlural: "View Groups",
          description: "(System) View Groups",
          fieldsList: [
            {
              __typename: "Field",
              id: "dc7c4c1c-e667-4716-8af5-f5ae7a5c0f0a",
              type: "UUID",
              name: "fieldMetadataId",
              icon: "IconTag",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Field Metadata Id",
              description: "View Group target field"
            },
            {
              __typename: "Field",
              id: "b531e9f6-63e7-4c8d-a886-c21b2113b446",
              type: "BOOLEAN",
              name: "isVisible",
              icon: "IconEye",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: true,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Visible",
              description: "View Group visibility"
            },
            {
              __typename: "Field",
              id: "11a05200-ba6c-41a0-97dc-951754033238",
              type: "TEXT",
              name: "fieldValue",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Field Value",
              description: "Group by this field value"
            },
            {
              __typename: "Field",
              id: "50694c02-ad79-46c3-9f33-e6267b975de7",
              type: "NUMBER",
              name: "position",
              icon: "IconList",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Position",
              description: "View Field position"
            },
            {
              __typename: "Field",
              id: "b3df551f-1afb-4a2b-b899-3b49d111b16b",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "3b2e1bab-ea26-4dfe-9cbc-cca77ea4bd2b",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "fa553a39-7f53-4a9f-87cd-9e0fd5378e49",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "06e9ba2c-c177-4200-8f68-0b0dd2e77541",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "3dde306d-4c23-4d45-85a8-dffd07ab21bd",
              type: "UUID",
              name: "viewId",
              icon: "IconLayoutCollage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "View id (foreign key)",
              description: "View Group related view id foreign key"
            },
            {
              __typename: "Field",
              id: "3431bb7d-0440-44f9-aa04-b34423f2d7c6",
              type: "RELATION",
              name: "view",
              icon: "IconLayoutCollage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "View",
              description: "View Group related view",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "d11b0440-7558-4199-8bc3-3898f8912ba4",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "91b99843-10ae-412e-b482-bd5691a18b90",
                  nameSingular: "viewGroup",
                  namePlural: "viewGroups"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "3431bb7d-0440-44f9-aa04-b34423f2d7c6",
                  name: "view"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "ded05363-70e6-4a88-95f3-ce04bb547dd2",
                  nameSingular: "view",
                  namePlural: "views"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "416300ab-6908-427d-a28e-281b9076934e",
                  name: "viewGroups"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "8b371775-38b7-4e03-a48e-7798b17ab281",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_3819ec73f42c743a0d3700ae8e4",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "45781c4d-a197-4a68-bc22-2ad3cad31e9b",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "06e9ba2c-c177-4200-8f68-0b0dd2e77541"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "0b6e7e84-b454-48ea-8af8-d72f6d6f5aa9",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "3dde306d-4c23-4d45-85a8-dffd07ab21bd"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "8a943c8f-aceb-48a6-ac07-a0dca6712059",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "workflowEventListener",
          namePlural: "workflowEventListeners",
          icon: "IconSettingsAutomation",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "7a836cd1-9002-44c6-8ce4-17558bb97a34",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "WorkflowEventListener",
          labelPlural: "WorkflowEventListeners",
          description: "A workflow event listener",
          fieldsList: [
            {
              __typename: "Field",
              id: "7a836cd1-9002-44c6-8ce4-17558bb97a34",
              type: "TEXT",
              name: "eventName",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Name",
              description: "The workflow event listener name"
            },
            {
              __typename: "Field",
              id: "3923c940-09a6-4d5c-8d40-72bb50c6df1e",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "9159178e-584e-4096-b248-0e2bfdee718f",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "52aab2ea-bd4d-4be3-ac52-8e66fab96225",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "85e6ecef-a50c-4ce1-b0ab-52d0b17848b8",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "d76d5742-7c6e-479b-a40d-e4338d52c0a9",
              type: "UUID",
              name: "workflowId",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Workflow id (foreign key)",
              description: "WorkflowEventListener workflow id foreign key"
            },
            {
              __typename: "Field",
              id: "e43ec871-59cb-40ec-9384-53c4fd2bc5fb",
              type: "RELATION",
              name: "workflow",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Workflow",
              description: "WorkflowEventListener workflow",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "eda58ebf-dc0b-4481-b9a6-dafc80afdceb",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "8a943c8f-aceb-48a6-ac07-a0dca6712059",
                  nameSingular: "workflowEventListener",
                  namePlural: "workflowEventListeners"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "e43ec871-59cb-40ec-9384-53c4fd2bc5fb",
                  name: "workflow"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "18d91fb4-c535-425e-8ff7-fb68394dfbf5",
                  nameSingular: "workflow",
                  namePlural: "workflows"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "a2162b17-505f-4a9d-bf93-cbc06242a14c",
                  name: "eventListeners"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "91aaa6aa-5b29-48a1-bd1c-fce47d6e21d4",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_9d6a1fb98ccde16ede8c5949d40",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "fe3bcc5c-735e-48b2-991a-8e2ab1945eb7",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "85e6ecef-a50c-4ce1-b0ab-52d0b17848b8"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "6b82ae18-f0ee-4d8a-bf82-b7b1344b6109",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "taskTarget",
          namePlural: "taskTargets",
          icon: "IconCheckbox",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "6f4cc8ad-8342-4e36-b689-2474d767885f",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Task Target",
          labelPlural: "Task Targets",
          description: "A task target",
          fieldsList: [
            {
              __typename: "Field",
              id: "6f4cc8ad-8342-4e36-b689-2474d767885f",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "019ae8ca-9bb2-444a-a27c-77a23bff0a82",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "ba47256f-1286-44c2-8103-96f8fea06477",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "a2d01338-0bcd-4190-9eff-c88271714446",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "6d3bf4a3-ec1b-47ad-b07b-69beab666248",
              type: "UUID",
              name: "taskId",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Task id (foreign key)",
              description: "TaskTarget task id foreign key"
            },
            {
              __typename: "Field",
              id: "e43067bc-42c6-4f02-8ffe-3773144180cc",
              type: "RELATION",
              name: "task",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Task",
              description: "TaskTarget task",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "1b6e98ac-770b-4d19-9f6e-78fe733b7d20",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "6b82ae18-f0ee-4d8a-bf82-b7b1344b6109",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "e43067bc-42c6-4f02-8ffe-3773144180cc",
                  name: "task"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "18ff5583-7593-422c-abea-ced0195e281d",
                  nameSingular: "task",
                  namePlural: "tasks"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "d616da2f-7e9c-46f1-b6cc-7bbb0cf52b99",
                  name: "taskTargets"
                }
              }
            },
            {
              __typename: "Field",
              id: "7bc7c9ab-78a7-4be0-b300-c0084ccf214f",
              type: "UUID",
              name: "personId",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Person id (foreign key)",
              description: "TaskTarget person id foreign key"
            },
            {
              __typename: "Field",
              id: "d564534f-f3ce-40d7-9ab4-560c6758d45e",
              type: "RELATION",
              name: "person",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Person",
              description: "TaskTarget person",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "078dea5e-16b9-4896-83b1-919d58a7ec09",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "6b82ae18-f0ee-4d8a-bf82-b7b1344b6109",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "d564534f-f3ce-40d7-9ab4-560c6758d45e",
                  name: "person"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "49029f5c-50d8-41e7-b58c-4584ee54763f",
                  nameSingular: "person",
                  namePlural: "people"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "d6a47616-3bc2-44de-86e9-68344f82933c",
                  name: "taskTargets"
                }
              }
            },
            {
              __typename: "Field",
              id: "c64a002e-10d8-4ad9-b028-610f67f1249c",
              type: "UUID",
              name: "companyId",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Company id (foreign key)",
              description: "TaskTarget company id foreign key"
            },
            {
              __typename: "Field",
              id: "34e47260-354e-488e-a6ce-be7d853e0c54",
              type: "RELATION",
              name: "company",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Company",
              description: "TaskTarget company",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "8f5823cf-7f62-49de-8fb2-f5e79259b06e",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "6b82ae18-f0ee-4d8a-bf82-b7b1344b6109",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "34e47260-354e-488e-a6ce-be7d853e0c54",
                  name: "company"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "d6742106-e3ac-4e28-95ad-0ae1f9f2c202",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "93ebdd78-0e1c-4ad3-855a-7e655ecb697d",
                  name: "taskTargets"
                }
              }
            },
            {
              __typename: "Field",
              id: "5a22b54f-5e89-4436-a3f0-37d37cd99f6a",
              type: "UUID",
              name: "opportunityId",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Opportunity id (foreign key)",
              description: "TaskTarget opportunity id foreign key"
            },
            {
              __typename: "Field",
              id: "695c6f99-bc49-4cc7-895d-71a2172a0da8",
              type: "RELATION",
              name: "opportunity",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Opportunity",
              description: "TaskTarget opportunity",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "b49784f1-76fc-4c0d-b16c-7af02c54e0ed",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "6b82ae18-f0ee-4d8a-bf82-b7b1344b6109",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "695c6f99-bc49-4cc7-895d-71a2172a0da8",
                  name: "opportunity"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "4afa7501-4bd9-4ec7-bd07-ce6f69ad0d98",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "9aa21b35-52eb-4ad9-a29d-6b92450f8d81",
                  name: "taskTargets"
                }
              }
            },
            {
              __typename: "Field",
              id: "47a3e14b-dbbd-4c40-b3f5-f51412d8408e",
              type: "RELATION",
              name: "pet",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.335Z",
              updatedAt: "2025-02-11T09:14:39.335Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Pet",
              description: "TaskTargets Pet",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "8e47bced-f608-4dc7-90a2-7ae7a7cf869c",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "6b82ae18-f0ee-4d8a-bf82-b7b1344b6109",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "47a3e14b-dbbd-4c40-b3f5-f51412d8408e",
                  name: "pet"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "055c2349-c786-4389-b09d-09c89fc131bc",
                  nameSingular: "pet",
                  namePlural: "pets"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "8bb25e73-ea02-4fbd-a37e-7f216dd63eb9",
                  name: "taskTargets"
                }
              }
            },
            {
              __typename: "Field",
              id: "3c82d755-b868-48a9-8f07-7d29c820de7f",
              type: "UUID",
              name: "petId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.335Z",
              updatedAt: "2025-02-11T09:14:39.335Z",
              defaultValue: null,
              options: null,
              settings: {
                isForeignKey: true
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Pet ID (foreign key)",
              description: "Task Target Pet id foreign key"
            },
            {
              __typename: "Field",
              id: "c0103f7e-0357-40d6-8c08-7aa1b0716f4a",
              type: "RELATION",
              name: "surveyResult",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.051Z",
              updatedAt: "2025-02-11T09:14:40.051Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Survey result",
              description: "TaskTargets Survey result",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "748f0c32-6bc4-4bef-9b07-c722989613d7",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "6b82ae18-f0ee-4d8a-bf82-b7b1344b6109",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "c0103f7e-0357-40d6-8c08-7aa1b0716f4a",
                  name: "surveyResult"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "3433f66e-e32c-4b99-b48b-38e6d23501cc",
                  nameSingular: "surveyResult",
                  namePlural: "surveyResults"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "86bbe7f3-8480-4c5c-9eed-3168a563176c",
                  name: "taskTargets"
                }
              }
            },
            {
              __typename: "Field",
              id: "22bf1cea-eda1-48cc-a864-73c914e64832",
              type: "UUID",
              name: "surveyResultId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.051Z",
              updatedAt: "2025-02-11T09:14:40.051Z",
              defaultValue: null,
              options: null,
              settings: {
                isForeignKey: true
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Survey result ID (foreign key)",
              description: "Task Target Survey result id foreign key"
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "c1d982a9-fe06-44c1-b1c4-05ccee4cc13b",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_cf12e6c92058f11b59852ffdfe3",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "0b95b641-a37e-42a5-8ff2-dc8e6dc35d43",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "7bc7c9ab-78a7-4be0-b300-c0084ccf214f"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "9de830ab-9936-4c5d-a813-9e5c54be1b7d",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_627d4437c96f22d5d46cc9a85bb",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "4bb59d8c-06cb-4254-afae-252eb553dbc6",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "a2d01338-0bcd-4190-9eff-c88271714446"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "86d6d981-1399-4f7b-8c58-b83f585fa79a",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "6d3bf4a3-ec1b-47ad-b07b-69beab666248"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "b036c993-d9ff-4703-810e-cd339344a9ed",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_4e929e3af362914c41035c4d438",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "afca967b-2fe4-4215-bd96-40eaffa6deb8",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "a2d01338-0bcd-4190-9eff-c88271714446"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "227584f4-7ffe-42a0-a1d9-2985ee8f5581",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_b0ba7efcd8c529922bf6e858bc1",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "1e9f152b-53d0-4c2a-b5ef-ad89c82b7727",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "a2d01338-0bcd-4190-9eff-c88271714446"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "65d58960-69b9-42b5-ae4b-ab82c0068dbb",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "viewFilter",
          namePlural: "viewFilters",
          icon: "IconFilterBolt",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "dafe5e84-56d7-4cb8-a11e-7423e9e1c414",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "View Filter",
          labelPlural: "View Filters",
          description: "(System) View Filters",
          fieldsList: [
            {
              __typename: "Field",
              id: "9648975f-9e68-4c1e-a777-0b3f483353e5",
              type: "UUID",
              name: "fieldMetadataId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Field Metadata Id",
              description: "View Filter target field"
            },
            {
              __typename: "Field",
              id: "35f7b699-acbe-47e1-9748-20aea4e49842",
              type: "TEXT",
              name: "operand",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'Contains'",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Operand",
              description: "View Filter operand"
            },
            {
              __typename: "Field",
              id: "a2e353b1-fbfd-4505-bcb4-501c3ddcd0a1",
              type: "TEXT",
              name: "value",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Value",
              description: "View Filter value"
            },
            {
              __typename: "Field",
              id: "700129c3-86b5-4bdf-a8f0-b419e13f11d1",
              type: "TEXT",
              name: "displayValue",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Display Value",
              description: "View Filter Display Value"
            },
            {
              __typename: "Field",
              id: "2857bd72-3900-4bd3-8571-6fa45c3c74c9",
              type: "UUID",
              name: "viewFilterGroupId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "View Filter Group Id",
              description: "View Filter Group"
            },
            {
              __typename: "Field",
              id: "4bbde1dd-3933-4ee6-9e4b-a358b33f469d",
              type: "POSITION",
              name: "positionInViewFilterGroup",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Position in view filter group",
              description: "Position in the view filter group"
            },
            {
              __typename: "Field",
              id: "dafe5e84-56d7-4cb8-a11e-7423e9e1c414",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "c737c024-5d8f-4ee0-8f20-7aa49179433a",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "72cdc5f4-94f7-4e8d-9428-39acdd835411",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "43937666-9b32-4654-a678-94ae8f39c6ff",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "d8335a43-663c-4083-b1bd-c27d31457a83",
              type: "UUID",
              name: "viewId",
              icon: "IconLayoutCollage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "View id (foreign key)",
              description: "View Filter related view id foreign key"
            },
            {
              __typename: "Field",
              id: "7c9fe4e1-88a5-4e9a-b02d-3376f1724073",
              type: "RELATION",
              name: "view",
              icon: "IconLayoutCollage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "View",
              description: "View Filter related view",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "0e8cbad2-f76e-495d-8ef9-c3261e6b8269",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "65d58960-69b9-42b5-ae4b-ab82c0068dbb",
                  nameSingular: "viewFilter",
                  namePlural: "viewFilters"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "7c9fe4e1-88a5-4e9a-b02d-3376f1724073",
                  name: "view"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "ded05363-70e6-4a88-95f3-ce04bb547dd2",
                  nameSingular: "view",
                  namePlural: "views"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "6f0a0296-abf3-42fd-a882-7fadbf281ed0",
                  name: "viewFilters"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "b8c34fb0-3e0e-404d-ab75-6e2b4ca0129e",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_5653b106ee9a9e3d5c1c790419a",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "291e80d0-9e25-4dec-9d3b-a48629f21eda",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "d8335a43-663c-4083-b1bd-c27d31457a83"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "5deb0840-caf9-44ec-98be-8fcad3816c2f",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "messageChannel",
          namePlural: "messageChannels",
          icon: "IconMessage",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "002c37a7-caa7-48de-b453-c409528fb789",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Message Channel",
          labelPlural: "Message Channels",
          description: "Message Channels",
          fieldsList: [
            {
              __typename: "Field",
              id: "1866ae19-0e02-463d-87b7-6140509bb8bb",
              type: "SELECT",
              name: "visibility",
              icon: "IconEyeglass",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'SHARE_EVERYTHING'",
              options: [
                {
                  id: "133a966a-7cc2-480c-8861-e09581893a6d",
                  color: "green",
                  label: "Metadata",
                  value: "METADATA",
                  position: 0
                },
                {
                  id: "d3ecf3ce-5064-4d8d-bccb-18a701570b02",
                  color: "blue",
                  label: "Subject",
                  value: "SUBJECT",
                  position: 1
                },
                {
                  id: "acd98242-d058-448c-9276-79a7d5e49a42",
                  color: "orange",
                  label: "Share Everything",
                  value: "SHARE_EVERYTHING",
                  position: 2
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Visibility",
              description: "Visibility"
            },
            {
              __typename: "Field",
              id: "002c37a7-caa7-48de-b453-c409528fb789",
              type: "TEXT",
              name: "handle",
              icon: "IconAt",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Handle",
              description: "Handle"
            },
            {
              __typename: "Field",
              id: "ccfa8f55-4cdd-406c-8b8f-6fce6398fd9d",
              type: "SELECT",
              name: "type",
              icon: "IconMessage",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'email'",
              options: [
                {
                  id: "c8573120-afe4-402b-b262-c42467b5a40e",
                  color: "green",
                  label: "Email",
                  value: "email",
                  position: 0
                },
                {
                  id: "dba3d031-87cf-4d22-a2d5-6e2c19b6e0d6",
                  color: "blue",
                  label: "SMS",
                  value: "sms",
                  position: 1
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Type",
              description: "Channel Type"
            },
            {
              __typename: "Field",
              id: "daa56f86-2962-45ae-a644-eb2fcba2286e",
              type: "BOOLEAN",
              name: "isContactAutoCreationEnabled",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: true,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Is Contact Auto Creation Enabled",
              description: "Is Contact Auto Creation Enabled"
            },
            {
              __typename: "Field",
              id: "3f77d054-26c8-4dc1-891e-086d87826bb5",
              type: "SELECT",
              name: "contactAutoCreationPolicy",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'SENT'",
              options: [
                {
                  id: "c3490102-c4fb-4d3d-917b-3e5bbb82b005",
                  color: "green",
                  label: "Sent and Received",
                  value: "SENT_AND_RECEIVED",
                  position: 0
                },
                {
                  id: "915c95e4-e4de-4ad8-869c-5edf1d826975",
                  color: "blue",
                  label: "Sent",
                  value: "SENT",
                  position: 1
                },
                {
                  id: "728eff32-b88f-4fcc-82ad-4bc390c99e2d",
                  color: "red",
                  label: "None",
                  value: "NONE",
                  position: 2
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Contact auto creation policy",
              description: "Automatically create People records when receiving or sending emails"
            },
            {
              __typename: "Field",
              id: "a34c8cfd-a4be-47ac-ad88-9dbbcc36a279",
              type: "BOOLEAN",
              name: "excludeNonProfessionalEmails",
              icon: "IconBriefcase",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: true,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Exclude non professional emails",
              description: "Exclude non professional emails"
            },
            {
              __typename: "Field",
              id: "34ea7542-5326-4b83-a46d-4987e9bb87e9",
              type: "BOOLEAN",
              name: "excludeGroupEmails",
              icon: "IconUsersGroup",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: true,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Exclude group emails",
              description: "Exclude group emails"
            },
            {
              __typename: "Field",
              id: "f5f2ae18-426a-4909-b249-82397ccee902",
              type: "BOOLEAN",
              name: "isSyncEnabled",
              icon: "IconRefresh",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: true,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Is Sync Enabled",
              description: "Is Sync Enabled"
            },
            {
              __typename: "Field",
              id: "eb5ef484-e4c5-4501-8cef-e7ff2280dd80",
              type: "TEXT",
              name: "syncCursor",
              icon: "IconHistory",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last sync cursor",
              description: "Last sync cursor"
            },
            {
              __typename: "Field",
              id: "344093c2-0c04-4099-9caf-0a6e33b7d7c9",
              type: "DATE_TIME",
              name: "syncedAt",
              icon: "IconHistory",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last sync date",
              description: "Last sync date"
            },
            {
              __typename: "Field",
              id: "991f3ee6-eb62-4b66-954e-1d7640f5e2e8",
              type: "SELECT",
              name: "syncStatus",
              icon: "IconStatusChange",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: [
                {
                  id: "6383a690-6f9e-4076-a06b-280484d3fbda",
                  color: "yellow",
                  label: "Ongoing",
                  value: "ONGOING",
                  position: 1
                },
                {
                  id: "af88b6d0-9bd4-4ca1-8e15-ca8228a0f9bb",
                  color: "blue",
                  label: "Not Synced",
                  value: "NOT_SYNCED",
                  position: 2
                },
                {
                  id: "f40c84cb-b90f-467e-995e-87948c947e6d",
                  color: "green",
                  label: "Active",
                  value: "ACTIVE",
                  position: 3
                },
                {
                  id: "693aee22-4546-4ed4-8199-65bc84c4de85",
                  color: "red",
                  label: "Failed Insufficient Permissions",
                  value: "FAILED_INSUFFICIENT_PERMISSIONS",
                  position: 4
                },
                {
                  id: "7d384eff-7961-40bf-a3e5-d7da54235f23",
                  color: "red",
                  label: "Failed Unknown",
                  value: "FAILED_UNKNOWN",
                  position: 5
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Sync status",
              description: "Sync status"
            },
            {
              __typename: "Field",
              id: "0ad2ed94-9205-4c77-948b-4e3d4e24a789",
              type: "SELECT",
              name: "syncStage",
              icon: "IconStatusChange",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'FULL_MESSAGE_LIST_FETCH_PENDING'",
              options: [
                {
                  id: "1bab967c-7579-4291-9e4c-5674c4b7dc38",
                  color: "blue",
                  label: "Full messages list fetch pending",
                  value: "FULL_MESSAGE_LIST_FETCH_PENDING",
                  position: 0
                },
                {
                  id: "3cca5b27-1b73-45aa-aab3-9fe95f3860e5",
                  color: "blue",
                  label: "Partial messages list fetch pending",
                  value: "PARTIAL_MESSAGE_LIST_FETCH_PENDING",
                  position: 1
                },
                {
                  id: "1d4bb1e0-3e6e-4c46-b8b5-1e1873b49d60",
                  color: "orange",
                  label: "Messages list fetch ongoing",
                  value: "MESSAGE_LIST_FETCH_ONGOING",
                  position: 2
                },
                {
                  id: "c7cd7ebd-4727-40b9-8457-3704adff2ecb",
                  color: "blue",
                  label: "Messages import pending",
                  value: "MESSAGES_IMPORT_PENDING",
                  position: 3
                },
                {
                  id: "964b3f6e-8487-4c42-8b0f-4bd6d5f72e26",
                  color: "orange",
                  label: "Messages import ongoing",
                  value: "MESSAGES_IMPORT_ONGOING",
                  position: 4
                },
                {
                  id: "3c370714-e3f2-45c7-a1ca-776ec830784e",
                  color: "red",
                  label: "Failed",
                  value: "FAILED",
                  position: 5
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Sync stage",
              description: "Sync stage"
            },
            {
              __typename: "Field",
              id: "2606e850-3622-430f-941f-99bd820eadbc",
              type: "DATE_TIME",
              name: "syncStageStartedAt",
              icon: "IconHistory",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Sync stage started at",
              description: "Sync stage started at"
            },
            {
              __typename: "Field",
              id: "c057853a-fc51-4019-a9d8-8a5bf37c4ffa",
              type: "NUMBER",
              name: "throttleFailureCount",
              icon: "IconX",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Throttle Failure Count",
              description: "Throttle Failure Count"
            },
            {
              __typename: "Field",
              id: "96656edd-1468-4d31-8270-f7e77136ce56",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "0c1e9c87-7b90-4587-bc3e-c4b742bfeb63",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "5f9190d0-7472-495c-ab39-e9b2e45897d8",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "3333809d-9198-4068-9085-32b9df14f98d",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "d1879238-ed6b-49b2-b884-d90a0bf0396a",
              type: "UUID",
              name: "connectedAccountId",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Connected Account id (foreign key)",
              description: "Connected Account id foreign key"
            },
            {
              __typename: "Field",
              id: "4212965a-5878-495b-a6be-7eb8fa890aae",
              type: "RELATION",
              name: "connectedAccount",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Connected Account",
              description: "Connected Account",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "6e1db9e6-ab3c-400c-9628-924c4ca05250",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "5deb0840-caf9-44ec-98be-8fcad3816c2f",
                  nameSingular: "messageChannel",
                  namePlural: "messageChannels"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "4212965a-5878-495b-a6be-7eb8fa890aae",
                  name: "connectedAccount"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "cd2e1f83-3e54-48b5-83bd-ff4338add50d",
                  nameSingular: "connectedAccount",
                  namePlural: "connectedAccounts"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "32f9c6ab-25c0-4d5f-b375-efe1c22dafc7",
                  name: "messageChannels"
                }
              }
            },
            {
              __typename: "Field",
              id: "f7846b0f-6aad-4fff-be91-4f7978bf29ab",
              type: "RELATION",
              name: "messageChannelMessageAssociations",
              icon: "IconMessage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Message Channel Association",
              description: "Messages from the channel.",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "2f5e3858-8121-4eec-9a9e-b8e9adea3510",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "5deb0840-caf9-44ec-98be-8fcad3816c2f",
                  nameSingular: "messageChannel",
                  namePlural: "messageChannels"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "f7846b0f-6aad-4fff-be91-4f7978bf29ab",
                  name: "messageChannelMessageAssociations"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "01e5d86a-6039-400a-8004-d9058c5eb2c7",
                  nameSingular: "messageChannelMessageAssociation",
                  namePlural: "messageChannelMessageAssociations"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "e20e3bd7-7e29-4eb6-8fe1-862ed69bcde4",
                  name: "messageChannel"
                }
              }
            },
            {
              __typename: "Field",
              id: "a83b1fe2-5b63-4f9e-96d1-81f0b34858b2",
              type: "RELATION",
              name: "messageFolders",
              icon: "IconFolder",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Message Folders",
              description: "Message Folders",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "9153c4bc-c819-4ca6-b95a-ffabb71badbc",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "5deb0840-caf9-44ec-98be-8fcad3816c2f",
                  nameSingular: "messageChannel",
                  namePlural: "messageChannels"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "a83b1fe2-5b63-4f9e-96d1-81f0b34858b2",
                  name: "messageFolders"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "dc01c3ca-3140-45d8-a02d-a862055ba945",
                  nameSingular: "messageFolder",
                  namePlural: "messageFolders"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "8ca1e781-0c90-4239-8739-a8e053386f86",
                  name: "messageChannel"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "df32a9bf-3736-4d16-90ff-e783bce4e037",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_c3af632ce35236d21f8ae1f4cfd",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "d403476d-552c-4ed5-b549-1569b112d58b",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "d1879238-ed6b-49b2-b884-d90a0bf0396a"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "5b44308a-da32-447e-b210-bf52f1230689",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "calendarChannel",
          namePlural: "calendarChannels",
          icon: "IconCalendar",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "321ef6c3-e01f-4080-9e8e-938810622ed8",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Calendar Channel",
          labelPlural: "Calendar Channels",
          description: "Calendar Channels",
          fieldsList: [
            {
              __typename: "Field",
              id: "321ef6c3-e01f-4080-9e8e-938810622ed8",
              type: "TEXT",
              name: "handle",
              icon: "IconAt",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Handle",
              description: "Handle"
            },
            {
              __typename: "Field",
              id: "187310d3-6bf0-488c-bc53-21aa8f69eb87",
              type: "SELECT",
              name: "syncStatus",
              icon: "IconStatusChange",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: [
                {
                  id: "58a4b186-debf-42ff-867d-6b6b706b0eb6",
                  color: "yellow",
                  label: "Ongoing",
                  value: "ONGOING",
                  position: 1
                },
                {
                  id: "2c4c961f-27db-455d-906e-40dcd4596f6c",
                  color: "blue",
                  label: "Not Synced",
                  value: "NOT_SYNCED",
                  position: 2
                },
                {
                  id: "b5df442d-ef3e-41e9-8fc3-865f4440ac7e",
                  color: "green",
                  label: "Active",
                  value: "ACTIVE",
                  position: 3
                },
                {
                  id: "7397c7f9-c210-4632-a4d3-64857bb97e1a",
                  color: "red",
                  label: "Failed Insufficient Permissions",
                  value: "FAILED_INSUFFICIENT_PERMISSIONS",
                  position: 4
                },
                {
                  id: "32d3ea64-e7e5-4178-b861-57c0a5d05d61",
                  color: "red",
                  label: "Failed Unknown",
                  value: "FAILED_UNKNOWN",
                  position: 5
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Sync status",
              description: "Sync status"
            },
            {
              __typename: "Field",
              id: "ce7d2396-e3c0-483f-bc83-b7afb239fb7c",
              type: "SELECT",
              name: "syncStage",
              icon: "IconStatusChange",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'FULL_CALENDAR_EVENT_LIST_FETCH_PENDING'",
              options: [
                {
                  id: "678b287b-f345-4d92-9f92-1c4bda4a760f",
                  color: "blue",
                  label: "Full calendar event list fetch pending",
                  value: "FULL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                  position: 0
                },
                {
                  id: "8269f0d0-31c2-4e1f-8416-f551442b03f8",
                  color: "blue",
                  label: "Partial calendar event list fetch pending",
                  value: "PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                  position: 1
                },
                {
                  id: "fe3d9dfe-df51-438d-9d58-34d5c6082b84",
                  color: "orange",
                  label: "Calendar event list fetch ongoing",
                  value: "CALENDAR_EVENT_LIST_FETCH_ONGOING",
                  position: 2
                },
                {
                  id: "9243f2bd-f000-4310-b116-7867a4ddccba",
                  color: "blue",
                  label: "Calendar events import pending",
                  value: "CALENDAR_EVENTS_IMPORT_PENDING",
                  position: 3
                },
                {
                  id: "394be34a-6417-4bd1-b3a8-56dabaed39da",
                  color: "orange",
                  label: "Calendar events import ongoing",
                  value: "CALENDAR_EVENTS_IMPORT_ONGOING",
                  position: 4
                },
                {
                  id: "76e70401-fa9f-4c56-9344-90d908a95ab8",
                  color: "red",
                  label: "Failed",
                  value: "FAILED",
                  position: 5
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Sync stage",
              description: "Sync stage"
            },
            {
              __typename: "Field",
              id: "7a2b1365-e6d5-49c5-b8c3-2690ea915bdb",
              type: "SELECT",
              name: "visibility",
              icon: "IconEyeglass",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'SHARE_EVERYTHING'",
              options: [
                {
                  id: "01bdcd18-fcae-443e-bba6-da44335e4da6",
                  color: "green",
                  label: "Metadata",
                  value: "METADATA",
                  position: 0
                },
                {
                  id: "71e1cb03-e010-4524-927f-ee916de441a5",
                  color: "orange",
                  label: "Share Everything",
                  value: "SHARE_EVERYTHING",
                  position: 1
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Visibility",
              description: "Visibility"
            },
            {
              __typename: "Field",
              id: "39ce7478-b55a-40ad-bea2-d701b55fff13",
              type: "BOOLEAN",
              name: "isContactAutoCreationEnabled",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: true,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Is Contact Auto Creation Enabled",
              description: "Is Contact Auto Creation Enabled"
            },
            {
              __typename: "Field",
              id: "0eeebceb-73f5-42ed-83b4-ceb436c33a47",
              type: "SELECT",
              name: "contactAutoCreationPolicy",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'AS_PARTICIPANT_AND_ORGANIZER'",
              options: [
                {
                  id: "ed654c2b-a7c2-49f5-8fbc-9c5a3725421a",
                  color: "green",
                  label: "As Participant and Organizer",
                  value: "AS_PARTICIPANT_AND_ORGANIZER",
                  position: 0
                },
                {
                  id: "b37ebd4a-e226-4d14-8590-963c60465dcb",
                  color: "orange",
                  label: "As Participant",
                  value: "AS_PARTICIPANT",
                  position: 1
                },
                {
                  id: "e7da2f75-8fd6-49f1-b400-15ea49365fa7",
                  color: "blue",
                  label: "As Organizer",
                  value: "AS_ORGANIZER",
                  position: 2
                },
                {
                  id: "776e518a-6b2b-470d-9fe5-0ec34fcd2698",
                  color: "red",
                  label: "None",
                  value: "NONE",
                  position: 3
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Contact auto creation policy",
              description: "Automatically create records for people you participated with in an event."
            },
            {
              __typename: "Field",
              id: "b22fb1e0-409e-4b88-b584-aa57e27ff10c",
              type: "BOOLEAN",
              name: "isSyncEnabled",
              icon: "IconRefresh",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: true,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Is Sync Enabled",
              description: "Is Sync Enabled"
            },
            {
              __typename: "Field",
              id: "053468ef-3c36-445a-a570-ef6c41cf0d8c",
              type: "TEXT",
              name: "syncCursor",
              icon: "IconReload",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Sync Cursor",
              description: "Sync Cursor. Used for syncing events from the calendar provider"
            },
            {
              __typename: "Field",
              id: "19518c21-5c1f-4464-9fea-66afc51d4aa7",
              type: "DATE_TIME",
              name: "syncedAt",
              icon: "IconHistory",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last sync date",
              description: "Last sync date"
            },
            {
              __typename: "Field",
              id: "29a5458f-ebba-4858-bdde-b3d758861168",
              type: "DATE_TIME",
              name: "syncStageStartedAt",
              icon: "IconHistory",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Sync stage started at",
              description: "Sync stage started at"
            },
            {
              __typename: "Field",
              id: "0cf1ae27-4dbb-4d44-8f51-b03ebbcfcea1",
              type: "NUMBER",
              name: "throttleFailureCount",
              icon: "IconX",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Throttle Failure Count",
              description: "Throttle Failure Count"
            },
            {
              __typename: "Field",
              id: "5590998d-ab5f-4a90-ba2f-f725141675a6",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "0c0209a7-c51b-4749-9469-4d67256b4439",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "62d90bfb-a74e-4fee-9fcd-d4952b6441f9",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "f34e6293-cdca-4caa-ac06-a888f76913fa",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "8e1e08b4-aecb-4769-972d-2c98ebde1523",
              type: "UUID",
              name: "connectedAccountId",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Connected Account id (foreign key)",
              description: "Connected Account id foreign key"
            },
            {
              __typename: "Field",
              id: "93fc5679-12be-4449-be39-437b82da4abb",
              type: "RELATION",
              name: "connectedAccount",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Connected Account",
              description: "Connected Account",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "2f7c0663-cee2-4b82-b5fc-94c99ef20299",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "5b44308a-da32-447e-b210-bf52f1230689",
                  nameSingular: "calendarChannel",
                  namePlural: "calendarChannels"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "93fc5679-12be-4449-be39-437b82da4abb",
                  name: "connectedAccount"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "cd2e1f83-3e54-48b5-83bd-ff4338add50d",
                  nameSingular: "connectedAccount",
                  namePlural: "connectedAccounts"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "67dcf871-9baa-460a-b40a-85d137bd02f6",
                  name: "calendarChannels"
                }
              }
            },
            {
              __typename: "Field",
              id: "fe5e6a90-6cd8-4eaf-9c42-7316c01c5c73",
              type: "RELATION",
              name: "calendarChannelEventAssociations",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Calendar Channel Event Associations",
              description: "Calendar Channel Event Associations",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "c19cd272-8d34-40ea-a369-d6bd63bad394",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "5b44308a-da32-447e-b210-bf52f1230689",
                  nameSingular: "calendarChannel",
                  namePlural: "calendarChannels"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "fe5e6a90-6cd8-4eaf-9c42-7316c01c5c73",
                  name: "calendarChannelEventAssociations"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "aef9c77c-0623-4d60-adb6-1aaa3e07538f",
                  nameSingular: "calendarChannelEventAssociation",
                  namePlural: "calendarChannelEventAssociations"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "30a2da43-02a3-4648-851f-65d4ad841515",
                  name: "calendarChannel"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "1f22e24a-b24b-430e-ad67-71a5d912b8e5",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_3465c79448bacd2f1268e5f6310",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "2c1246c4-6981-4bd0-ac33-b6038c611568",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "8e1e08b4-aecb-4769-972d-2c98ebde1523"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "4afa7501-4bd9-4ec7-bd07-ce6f69ad0d98",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "opportunity",
          namePlural: "opportunities",
          icon: "IconTargetArrow",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: false,
          isSearchable: true,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "d4ee3d39-1df1-46a4-a9aa-569119458656",
          imageIdentifierFieldMetadataId: null,
          shortcut: "O",
          isLabelSyncedWithName: false,
          labelSingular: "Opportunity",
          labelPlural: "Opportunities",
          description: "An opportunity",
          fieldsList: [
            {
              __typename: "Field",
              id: "d4ee3d39-1df1-46a4-a9aa-569119458656",
              type: "TEXT",
              name: "name",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Name",
              description: "The opportunity name"
            },
            {
              __typename: "Field",
              id: "b6a3686b-cc90-45a3-92c8-43b2b920c4a8",
              type: "CURRENCY",
              name: "amount",
              icon: "IconCurrencyDollar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: {
                amountMicros: null,
                currencyCode: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Amount",
              description: "Opportunity amount"
            },
            {
              __typename: "Field",
              id: "0602c631-5cc0-405b-a745-c6cffc632ee3",
              type: "DATE_TIME",
              name: "closeDate",
              icon: "IconCalendarEvent",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Close date",
              description: "Opportunity close date"
            },
            {
              __typename: "Field",
              id: "48594de8-6781-4872-a81a-b60bdeacb6ec",
              type: "SELECT",
              name: "stage",
              icon: "IconProgressCheck",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'NEW'",
              options: [
                {
                  id: "6fe8e06d-3e19-4f6b-b42c-1a6a8e3e272f",
                  color: "red",
                  label: "New",
                  value: "NEW",
                  position: 0
                },
                {
                  id: "24df71dd-3329-480c-b830-cb5f1f34514c",
                  color: "purple",
                  label: "Screening",
                  value: "SCREENING",
                  position: 1
                },
                {
                  id: "ce3bd894-8b61-4428-9526-f3c6d27fa543",
                  color: "sky",
                  label: "Meeting",
                  value: "MEETING",
                  position: 2
                },
                {
                  id: "33b219a7-4326-4d9c-86bf-6944f237b5e4",
                  color: "turquoise",
                  label: "Proposal",
                  value: "PROPOSAL",
                  position: 3
                },
                {
                  id: "8610c2de-5f39-4ea6-adda-cffb44c3bec9",
                  color: "yellow",
                  label: "Customer",
                  value: "CUSTOMER",
                  position: 4
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Stage",
              description: "Opportunity stage"
            },
            {
              __typename: "Field",
              id: "f06f3343-81c0-459f-8834-a95a57829a32",
              type: "POSITION",
              name: "position",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Position",
              description: "Opportunity record position"
            },
            {
              __typename: "Field",
              id: "1063729b-4ccd-461e-ac4b-9fadac8774e1",
              type: "ACTOR",
              name: "createdBy",
              icon: "IconCreativeCommonsSa",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: {
                name: "'System'",
                source: "'MANUAL'",
                context: {}
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Created by",
              description: "The creator of the record"
            },
            {
              __typename: "Field",
              id: "12bea1fb-9f09-4681-af8e-9689de66b5ad",
              type: "TS_VECTOR",
              name: "searchVector",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Search vector",
              description: "Field used for full-text search"
            },
            {
              __typename: "Field",
              id: "19d16728-a04b-4089-8744-28f8790480da",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "036b82a9-781e-4ad6-a037-e318cc201ac2",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "23c29ffd-0bf3-43de-84ba-565376dfe6c2",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "ac9873a7-866c-4449-a2b6-49bec3e4a6f9",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "cb46e6ff-196b-4b4a-a375-eaea28c70e75",
              type: "UUID",
              name: "pointOfContactId",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Point of Contact id (foreign key)",
              description: "Opportunity point of contact id foreign key"
            },
            {
              __typename: "Field",
              id: "367f57bd-0340-4245-aca4-6127737926d8",
              type: "RELATION",
              name: "pointOfContact",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Point of Contact",
              description: "Opportunity point of contact",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "606d9f3e-6ee5-422b-89e2-3fd0b236143a",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "4afa7501-4bd9-4ec7-bd07-ce6f69ad0d98",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "367f57bd-0340-4245-aca4-6127737926d8",
                  name: "pointOfContact"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "49029f5c-50d8-41e7-b58c-4584ee54763f",
                  nameSingular: "person",
                  namePlural: "people"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "90e607fb-1903-4b29-bcfc-f59bc729730d",
                  name: "pointOfContactForOpportunities"
                }
              }
            },
            {
              __typename: "Field",
              id: "1dcf2bc1-c511-4f10-8d10-417db6d65c73",
              type: "UUID",
              name: "companyId",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Company id (foreign key)",
              description: "Opportunity company id foreign key"
            },
            {
              __typename: "Field",
              id: "f5459822-2e2e-4d4e-be6b-d2499a5c913f",
              type: "RELATION",
              name: "company",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Company",
              description: "Opportunity company",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "3b094cbc-081f-494b-96b3-04d54ba444eb",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "4afa7501-4bd9-4ec7-bd07-ce6f69ad0d98",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "f5459822-2e2e-4d4e-be6b-d2499a5c913f",
                  name: "company"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "d6742106-e3ac-4e28-95ad-0ae1f9f2c202",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "35805f7e-a952-4380-a2ba-00819b01e283",
                  name: "opportunities"
                }
              }
            },
            {
              __typename: "Field",
              id: "897c675f-511b-47b5-a86b-21a9ebf28403",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Favorites",
              description: "Favorites linked to the opportunity",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "9581c75b-3a72-497f-a007-490e040b1762",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "4afa7501-4bd9-4ec7-bd07-ce6f69ad0d98",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "897c675f-511b-47b5-a86b-21a9ebf28403",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "56d7cf1f-1d98-42d3-a89b-e35310615f69",
                  name: "opportunity"
                }
              }
            },
            {
              __typename: "Field",
              id: "9aa21b35-52eb-4ad9-a29d-6b92450f8d81",
              type: "RELATION",
              name: "taskTargets",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Tasks",
              description: "Tasks tied to the opportunity",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "b49784f1-76fc-4c0d-b16c-7af02c54e0ed",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "4afa7501-4bd9-4ec7-bd07-ce6f69ad0d98",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "9aa21b35-52eb-4ad9-a29d-6b92450f8d81",
                  name: "taskTargets"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "6b82ae18-f0ee-4d8a-bf82-b7b1344b6109",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "695c6f99-bc49-4cc7-895d-71a2172a0da8",
                  name: "opportunity"
                }
              }
            },
            {
              __typename: "Field",
              id: "74c12c73-15b2-425c-ac93-2f877d2cfde5",
              type: "RELATION",
              name: "noteTargets",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Notes",
              description: "Notes tied to the opportunity",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "85aefb41-952c-4b00-960d-b435da7ca073",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "4afa7501-4bd9-4ec7-bd07-ce6f69ad0d98",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "74c12c73-15b2-425c-ac93-2f877d2cfde5",
                  name: "noteTargets"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "e17eb8fc-5ba9-4479-9c76-f731f8584a9a",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "875de814-cf1d-4b7e-8038-f179c051ac0e",
                  name: "opportunity"
                }
              }
            },
            {
              __typename: "Field",
              id: "946569ff-dbe3-4635-a38b-5e744d88e359",
              type: "RELATION",
              name: "attachments",
              icon: "IconFileImport",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Attachments",
              description: "Attachments linked to the opportunity",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "b1a221bc-9192-4ba6-ad06-2bfdf8e173f3",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "4afa7501-4bd9-4ec7-bd07-ce6f69ad0d98",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "946569ff-dbe3-4635-a38b-5e744d88e359",
                  name: "attachments"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "b488fc13-032b-434c-acc9-a1b1cd9ad0d1",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "80955397-e206-49d8-a745-00ddc96ca76e",
                  name: "opportunity"
                }
              }
            },
            {
              __typename: "Field",
              id: "6331acfe-ae59-4de2-aad3-3ce9aaa31b6e",
              type: "RELATION",
              name: "timelineActivities",
              icon: "IconTimelineEvent",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Timeline Activities",
              description: "Timeline Activities linked to the opportunity.",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "81aef33e-7929-4186-a036-e7c779df6815",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "4afa7501-4bd9-4ec7-bd07-ce6f69ad0d98",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "6331acfe-ae59-4de2-aad3-3ce9aaa31b6e",
                  name: "timelineActivities"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "417786ec-7358-4019-b72b-6002551ed5e8",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "36012ebb-9c32-46b8-89c9-6d38264cb0b8",
                  name: "opportunity"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "abf44164-be7d-4dde-aeac-3019552c4d9d",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_82cdf247553f960093baa7c6635",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "de8dbe9e-e63f-4f00-b82c-0ba14bcc58f7",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "ac9873a7-866c-4449-a2b6-49bec3e4a6f9"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "2cf438b1-a185-4fc9-a5a6-672cb7708e62",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_4f469d3a7ee08aefdc099836364",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "f72efed9-24e9-43c2-82c7-721461ee7d00",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "48594de8-6781-4872-a81a-b60bdeacb6ec"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "cfd206ec-190e-4bd3-b773-a7f05dfd5455",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "ac9873a7-866c-4449-a2b6-49bec3e4a6f9"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "11b84d8a-e155-4ae2-b841-47d53acf9d95",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_9f96d65260c4676faac27cb6bf3",
                  indexWhereClause: null,
                  indexType: "GIN",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "602bdd87-5c27-4999-8c2e-b2e349a89629",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "12bea1fb-9f09-4681-af8e-9689de66b5ad"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "0db13244-baed-477c-baff-f3daab106966",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_425ac6c73ecb993cf9cbc2c2b00",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "73a14185-86b4-4527-8e07-e03b891957c0",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "ac9873a7-866c-4449-a2b6-49bec3e4a6f9"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "49029f5c-50d8-41e7-b58c-4584ee54763f",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "person",
          namePlural: "people",
          icon: "IconUser",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: false,
          isSearchable: true,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "9a08e8f4-4cf2-4586-b188-4542fe24c4e0",
          imageIdentifierFieldMetadataId: "7221b8ba-b214-408e-a080-572eb6880015",
          shortcut: "P",
          isLabelSyncedWithName: false,
          labelSingular: "Person",
          labelPlural: "People",
          description: "A person",
          fieldsList: [
            {
              __typename: "Field",
              id: "e7394f4c-bf15-4205-b92e-c2be1bce1052",
              type: "RELATION",
              name: "attachments",
              icon: "IconFileImport",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Attachments",
              description: "Attachments linked to the contact.",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "6a823e89-a5b7-4ec4-ae6e-9f3358af3c6b",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "49029f5c-50d8-41e7-b58c-4584ee54763f",
                  nameSingular: "person",
                  namePlural: "people"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "e7394f4c-bf15-4205-b92e-c2be1bce1052",
                  name: "attachments"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "b488fc13-032b-434c-acc9-a1b1cd9ad0d1",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "2f528146-253c-4080-9755-a09b1a7b4bb6",
                  name: "person"
                }
              }
            },
            {
              __typename: "Field",
              id: "9a08e8f4-4cf2-4586-b188-4542fe24c4e0",
              type: "FULL_NAME",
              name: "name",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: {
                lastName: "''",
                firstName: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Name",
              description: "Contact’s name"
            },
            {
              __typename: "Field",
              id: "1d71592c-9a4f-4b05-a1ad-4536ad841094",
              type: "EMAILS",
              name: "emails",
              icon: "IconMail",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: true,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: {
                primaryEmail: "''",
                additionalEmails: null
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Emails",
              description: "Contact’s Emails"
            },
            {
              __typename: "Field",
              id: "55f2c5b1-6f7c-4f8c-8631-48fa81022a3b",
              type: "LINKS",
              name: "linkedinLink",
              icon: "IconBrandLinkedin",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: {
                primaryLinkUrl: "''",
                secondaryLinks: "'[]'",
                primaryLinkLabel: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Linkedin",
              description: "Contact’s Linkedin account"
            },
            {
              __typename: "Field",
              id: "127ef7a2-c7a8-47bc-b0d2-e1feb1c0dde5",
              type: "LINKS",
              name: "xLink",
              icon: "IconBrandX",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: {
                primaryLinkUrl: "''",
                secondaryLinks: "'[]'",
                primaryLinkLabel: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "X",
              description: "Contact’s X/Twitter account"
            },
            {
              __typename: "Field",
              id: "e87fe9b9-47a4-42a7-badb-01ce267bec99",
              type: "TEXT",
              name: "jobTitle",
              icon: "IconBriefcase",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Job Title",
              description: "Contact’s job title"
            },
            {
              __typename: "Field",
              id: "8050b999-398d-4e5a-b2ed-e9dedbfd41b0",
              type: "PHONES",
              name: "phones",
              icon: "IconPhone",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: {
                additionalPhones: null,
                primaryPhoneNumber: "''",
                primaryPhoneCallingCode: "''",
                primaryPhoneCountryCode: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Phones",
              description: "Contact’s phone numbers"
            },
            {
              __typename: "Field",
              id: "08d49aab-97a7-4973-a5d6-28a9d0b4e87f",
              type: "TEXT",
              name: "city",
              icon: "IconMap",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "City",
              description: "Contact’s city"
            },
            {
              __typename: "Field",
              id: "7221b8ba-b214-408e-a080-572eb6880015",
              type: "TEXT",
              name: "avatarUrl",
              icon: "IconFileUpload",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Avatar",
              description: "Contact’s avatar"
            },
            {
              __typename: "Field",
              id: "e0014e76-43ec-4b81-9bd2-5293f1ffadf7",
              type: "POSITION",
              name: "position",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Position",
              description: "Person record Position"
            },
            {
              __typename: "Field",
              id: "cdcb9d43-b408-4e45-b545-5c1a5804e001",
              type: "ACTOR",
              name: "createdBy",
              icon: "IconCreativeCommonsSa",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: {
                name: "'System'",
                source: "'MANUAL'",
                context: {}
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Created by",
              description: "The creator of the record"
            },
            {
              __typename: "Field",
              id: "7cdc931f-6ecd-4dd6-8492-88aef6eec68e",
              type: "TS_VECTOR",
              name: "searchVector",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Search vector",
              description: "Field used for full-text search"
            },
            {
              __typename: "Field",
              id: "cfa3d391-8d55-44b2-9925-50ef11450554",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "768506e2-68df-4ee7-9c54-8539c5a4539f",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "622bf6ac-dd7a-49f6-9c66-4f3524bb2921",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "6a815379-3ba4-4471-9ea2-25e0fbf6ce81",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "2158124f-d803-4fec-952e-6bbb9453736d",
              type: "UUID",
              name: "companyId",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Company id (foreign key)",
              description: "Contact’s company id foreign key"
            },
            {
              __typename: "Field",
              id: "059cf3a7-47bb-4aef-ada1-3247d1c322c9",
              type: "RELATION",
              name: "company",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Company",
              description: "Contact’s company",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "139d9ea0-1e53-4fa7-bd92-222eff4c04b3",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "49029f5c-50d8-41e7-b58c-4584ee54763f",
                  nameSingular: "person",
                  namePlural: "people"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "059cf3a7-47bb-4aef-ada1-3247d1c322c9",
                  name: "company"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "d6742106-e3ac-4e28-95ad-0ae1f9f2c202",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "b78b28ae-adf1-4a1f-a984-4f6ab30504fa",
                  name: "people"
                }
              }
            },
            {
              __typename: "Field",
              id: "90e607fb-1903-4b29-bcfc-f59bc729730d",
              type: "RELATION",
              name: "pointOfContactForOpportunities",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Linked Opportunities",
              description: "List of opportunities for which that person is the point of contact",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "606d9f3e-6ee5-422b-89e2-3fd0b236143a",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "49029f5c-50d8-41e7-b58c-4584ee54763f",
                  nameSingular: "person",
                  namePlural: "people"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "90e607fb-1903-4b29-bcfc-f59bc729730d",
                  name: "pointOfContactForOpportunities"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "4afa7501-4bd9-4ec7-bd07-ce6f69ad0d98",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "367f57bd-0340-4245-aca4-6127737926d8",
                  name: "pointOfContact"
                }
              }
            },
            {
              __typename: "Field",
              id: "d6a47616-3bc2-44de-86e9-68344f82933c",
              type: "RELATION",
              name: "taskTargets",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Tasks",
              description: "Tasks tied to the contact",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "078dea5e-16b9-4896-83b1-919d58a7ec09",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "49029f5c-50d8-41e7-b58c-4584ee54763f",
                  nameSingular: "person",
                  namePlural: "people"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "d6a47616-3bc2-44de-86e9-68344f82933c",
                  name: "taskTargets"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "6b82ae18-f0ee-4d8a-bf82-b7b1344b6109",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "d564534f-f3ce-40d7-9ab4-560c6758d45e",
                  name: "person"
                }
              }
            },
            {
              __typename: "Field",
              id: "bcd93e0f-5451-45a5-b9e2-bc4c8a4a0b8d",
              type: "RELATION",
              name: "noteTargets",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Notes",
              description: "Notes tied to the contact",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "4beca7eb-f154-4a91-930b-91433dfa3d3a",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "49029f5c-50d8-41e7-b58c-4584ee54763f",
                  nameSingular: "person",
                  namePlural: "people"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "bcd93e0f-5451-45a5-b9e2-bc4c8a4a0b8d",
                  name: "noteTargets"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "e17eb8fc-5ba9-4479-9c76-f731f8584a9a",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "5401a0b6-64af-4736-b19f-ca03bcf9c955",
                  name: "person"
                }
              }
            },
            {
              __typename: "Field",
              id: "7d26908d-2099-40fe-b83e-64414ceb5b6a",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Favorites",
              description: "Favorites linked to the contact",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "4fff0ed3-ec08-4b53-86bf-2bc3bad9fde3",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "49029f5c-50d8-41e7-b58c-4584ee54763f",
                  nameSingular: "person",
                  namePlural: "people"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "7d26908d-2099-40fe-b83e-64414ceb5b6a",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "b62541e3-04a0-4569-907d-1eeaf498d296",
                  name: "person"
                }
              }
            },
            {
              __typename: "Field",
              id: "c11f28b1-68ee-4b28-b56d-194420bc8d1c",
              type: "RELATION",
              name: "messageParticipants",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Message Participants",
              description: "Message Participants",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "a322173d-9c7d-4780-bf93-9960189fd715",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "49029f5c-50d8-41e7-b58c-4584ee54763f",
                  nameSingular: "person",
                  namePlural: "people"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "c11f28b1-68ee-4b28-b56d-194420bc8d1c",
                  name: "messageParticipants"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "36411ed2-cbfe-44d4-bab6-52148d4d4485",
                  nameSingular: "messageParticipant",
                  namePlural: "messageParticipants"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "c4a59428-9163-4470-b1a8-26ca4a109b3f",
                  name: "person"
                }
              }
            },
            {
              __typename: "Field",
              id: "067f0ade-20c7-473c-93a9-bcbf08477ef0",
              type: "RELATION",
              name: "calendarEventParticipants",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Calendar Event Participants",
              description: "Calendar Event Participants",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "a2f54abe-3d86-4161-97ca-374207b6a502",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "49029f5c-50d8-41e7-b58c-4584ee54763f",
                  nameSingular: "person",
                  namePlural: "people"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "067f0ade-20c7-473c-93a9-bcbf08477ef0",
                  name: "calendarEventParticipants"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "dd054a83-dfee-4231-bbe0-ad690f189196",
                  nameSingular: "calendarEventParticipant",
                  namePlural: "calendarEventParticipants"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "b4d42e71-defb-4547-b82a-7a1b308d7af6",
                  name: "person"
                }
              }
            },
            {
              __typename: "Field",
              id: "423a8e73-c293-45aa-b83f-be5b26a110e1",
              type: "RELATION",
              name: "timelineActivities",
              icon: "IconTimelineEvent",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Events",
              description: "Events linked to the person",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "3be06bb4-2b05-405e-9f4e-1798bdef7f81",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "49029f5c-50d8-41e7-b58c-4584ee54763f",
                  nameSingular: "person",
                  namePlural: "people"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "423a8e73-c293-45aa-b83f-be5b26a110e1",
                  name: "timelineActivities"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "417786ec-7358-4019-b72b-6002551ed5e8",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "7c3a24c5-f678-4150-b0ef-c90c08a31252",
                  name: "person"
                }
              }
            },
            {
              __typename: "Field",
              id: "20e5955d-33b8-41e3-8281-277b828f2fac",
              type: "TEXT",
              name: "intro",
              icon: "IconNote",
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.064Z",
              updatedAt: "2025-02-11T09:14:39.064Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Intro",
              description: "Contact's Intro"
            },
            {
              __typename: "Field",
              id: "efb606fa-b37b-404f-992d-8553bc58e624",
              type: "PHONES",
              name: "whatsapp",
              icon: "IconBrandWhatsapp",
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.067Z",
              updatedAt: "2025-02-11T09:14:39.067Z",
              defaultValue: {
                additionalPhones: null,
                primaryPhoneNumber: "''",
                primaryPhoneCallingCode: "'+33'",
                primaryPhoneCountryCode: "'FR'"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Whatsapp",
              description: "Contact's Whatsapp Number"
            },
            {
              __typename: "Field",
              id: "06a96678-3d33-4bad-97bd-ad6fafbeb4fe",
              type: "MULTI_SELECT",
              name: "workPreference",
              icon: "IconHome",
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.069Z",
              updatedAt: "2025-02-11T09:14:39.069Z",
              defaultValue: null,
              options: [
                {
                  id: "e55b4fbf-1385-411d-88dc-385a808545e9",
                  color: "green",
                  label: "On-Site",
                  value: "ON_SITE",
                  position: 0
                },
                {
                  id: "e4e28b2a-8453-42f0-8f16-9744a4370f89",
                  color: "turquoise",
                  label: "Hybrid",
                  value: "HYBRID",
                  position: 1
                },
                {
                  id: "ed10d32c-4a0a-4900-9af9-f1643beb0b57",
                  color: "sky",
                  label: "Remote Work",
                  value: "REMOTE_WORK",
                  position: 2
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Work Preference",
              description: "Person's Work Preference"
            },
            {
              __typename: "Field",
              id: "c51d67c2-ec25-4e86-9151-5e6efa8e165c",
              type: "RATING",
              name: "performanceRating",
              icon: "IconStars",
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.071Z",
              updatedAt: "2025-02-11T09:14:39.071Z",
              defaultValue: null,
              options: [
                {
                  id: "6c5a9c80-ccda-4736-bc66-3709d7989282",
                  label: "1",
                  value: "RATING_1",
                  position: 0
                },
                {
                  id: "7428ddc1-3dd5-4349-818d-cf38dc218350",
                  label: "2",
                  value: "RATING_2",
                  position: 1
                },
                {
                  id: "e6c7a694-c622-4bb2-bf36-824ceddb65cf",
                  label: "3",
                  value: "RATING_3",
                  position: 2
                },
                {
                  id: "9d775040-8ff3-4804-81a5-36449ab4fac8",
                  label: "4",
                  value: "RATING_4",
                  position: 3
                },
                {
                  id: "ea4c8393-e9db-4d3e-a223-ce95a7f8c1ee",
                  label: "5",
                  value: "RATING_5",
                  position: 4
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Performance Rating",
              description: "Person's Performance Rating"
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "52f2dcfd-6f7f-4504-830c-01135ef84f3c",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_6a862a788ac6ce967afa06df812",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "b22639dc-bcc9-450e-a44c-b2b40bf47bc8",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "2158124f-d803-4fec-952e-6bbb9453736d"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "8c1aec3e-a498-4f0e-8cd5-47e7096c1ea2",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "6a815379-3ba4-4471-9ea2-25e0fbf6ce81"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "13f92389-1bba-4415-a5b8-c359aba8ebfe",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_UNIQUE_87914cd3ce963115f8cb943e2ac",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: true,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: []
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "7e3d6d80-9232-4872-a743-9759aaa835cb",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_bbd7aec1976fc684a0a5e4816c9",
                  indexWhereClause: null,
                  indexType: "GIN",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "4c89f3f4-791d-425b-944c-8c86bc589dfd",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "7cdc931f-6ecd-4dd6-8492-88aef6eec68e"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "417786ec-7358-4019-b72b-6002551ed5e8",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "timelineActivity",
          namePlural: "timelineActivities",
          icon: "IconTimelineEvent",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "91acce03-f503-4d7b-99ae-03898590baf6",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Timeline Activity",
          labelPlural: "Timeline Activities",
          description: "Aggregated / filtered event to be displayed on the timeline",
          fieldsList: [
            {
              __typename: "Field",
              id: "5adae6a9-ac22-4395-a127-fbee29cafcc4",
              type: "DATE_TIME",
              name: "happensAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "57a801bf-3434-49a0-b334-bf72131b3d16",
              type: "TEXT",
              name: "name",
              icon: "IconAbc",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Event name",
              description: "Event name"
            },
            {
              __typename: "Field",
              id: "c7a530df-9701-4827-89af-63b2c88fc84b",
              type: "RAW_JSON",
              name: "properties",
              icon: "IconListDetails",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Event details",
              description: "Json value for event details"
            },
            {
              __typename: "Field",
              id: "0477ec67-33d8-4b5d-aca7-59f4b88897ab",
              type: "TEXT",
              name: "linkedRecordCachedName",
              icon: "IconAbc",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Linked Record cached name",
              description: "Cached record name"
            },
            {
              __typename: "Field",
              id: "bf81eb88-a131-49a1-adf1-c8717af295a7",
              type: "UUID",
              name: "linkedRecordId",
              icon: "IconAbc",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Linked Record id",
              description: "Linked Record id"
            },
            {
              __typename: "Field",
              id: "2e6e4410-8321-4656-860b-d0117a462b6c",
              type: "UUID",
              name: "linkedObjectMetadataId",
              icon: "IconAbc",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Linked Object Metadata Id",
              description: "Linked Object Metadata Id"
            },
            {
              __typename: "Field",
              id: "91acce03-f503-4d7b-99ae-03898590baf6",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "17308167-7735-42a8-91c8-d22a76d13832",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "f67fe5cc-90d0-4195-acbc-e47c6ec27f45",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "fcaf92da-0539-42b4-88a5-baab2ce4e157",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "009e6914-a1b8-4f4e-9c36-b7a041998d77",
              type: "UUID",
              name: "workspaceMemberId",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Workspace Member id (foreign key)",
              description: "Event workspace member id foreign key"
            },
            {
              __typename: "Field",
              id: "eff8454d-8225-4237-bdc2-22e0117719db",
              type: "RELATION",
              name: "workspaceMember",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Workspace Member",
              description: "Event workspace member",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "904b7480-638d-4cc2-accc-911e342fc66b",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "417786ec-7358-4019-b72b-6002551ed5e8",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "eff8454d-8225-4237-bdc2-22e0117719db",
                  name: "workspaceMember"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "c841d49e-6664-4008-80bc-905c5540671e",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "deddc049-d741-4f44-a8fb-55c36634b673",
                  name: "timelineActivities"
                }
              }
            },
            {
              __typename: "Field",
              id: "a0c07a0d-3ec8-4ca5-9ce7-dfcf915ebdb4",
              type: "UUID",
              name: "personId",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Person id (foreign key)",
              description: "Event person id foreign key"
            },
            {
              __typename: "Field",
              id: "7c3a24c5-f678-4150-b0ef-c90c08a31252",
              type: "RELATION",
              name: "person",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Person",
              description: "Event person",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "3be06bb4-2b05-405e-9f4e-1798bdef7f81",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "417786ec-7358-4019-b72b-6002551ed5e8",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "7c3a24c5-f678-4150-b0ef-c90c08a31252",
                  name: "person"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "49029f5c-50d8-41e7-b58c-4584ee54763f",
                  nameSingular: "person",
                  namePlural: "people"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "423a8e73-c293-45aa-b83f-be5b26a110e1",
                  name: "timelineActivities"
                }
              }
            },
            {
              __typename: "Field",
              id: "8fa91df6-a6b2-4248-ae7f-a83e96248524",
              type: "UUID",
              name: "companyId",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Company id (foreign key)",
              description: "Event company id foreign key"
            },
            {
              __typename: "Field",
              id: "e1f28827-ab56-483a-af41-e696fcf65b02",
              type: "RELATION",
              name: "company",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Company",
              description: "Event company",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "6552eced-5240-43d2-8e74-c0f4955f92b0",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "417786ec-7358-4019-b72b-6002551ed5e8",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "e1f28827-ab56-483a-af41-e696fcf65b02",
                  name: "company"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "d6742106-e3ac-4e28-95ad-0ae1f9f2c202",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "bd5614ba-baf1-4929-96f8-9893225809bc",
                  name: "timelineActivities"
                }
              }
            },
            {
              __typename: "Field",
              id: "4799159e-b21a-4cce-bce4-905f6b2dba86",
              type: "UUID",
              name: "opportunityId",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Opportunity id (foreign key)",
              description: "Event opportunity id foreign key"
            },
            {
              __typename: "Field",
              id: "36012ebb-9c32-46b8-89c9-6d38264cb0b8",
              type: "RELATION",
              name: "opportunity",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Opportunity",
              description: "Event opportunity",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "81aef33e-7929-4186-a036-e7c779df6815",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "417786ec-7358-4019-b72b-6002551ed5e8",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "36012ebb-9c32-46b8-89c9-6d38264cb0b8",
                  name: "opportunity"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "4afa7501-4bd9-4ec7-bd07-ce6f69ad0d98",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "6331acfe-ae59-4de2-aad3-3ce9aaa31b6e",
                  name: "timelineActivities"
                }
              }
            },
            {
              __typename: "Field",
              id: "45aa9838-0e7a-438c-bec2-6ad6aabf4daa",
              type: "UUID",
              name: "noteId",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Note id (foreign key)",
              description: "Event note id foreign key"
            },
            {
              __typename: "Field",
              id: "e2fd43a9-dc31-4392-8dbf-90b8ad211c3d",
              type: "RELATION",
              name: "note",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Note",
              description: "Event note",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "9457ea57-a118-4b96-96a4-a8f83612025d",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "417786ec-7358-4019-b72b-6002551ed5e8",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "e2fd43a9-dc31-4392-8dbf-90b8ad211c3d",
                  name: "note"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "cf1e3f15-1ce2-444b-9507-69eb7dc40972",
                  nameSingular: "note",
                  namePlural: "notes"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "2791c2d9-6189-4240-9a9a-d9489faa764e",
                  name: "timelineActivities"
                }
              }
            },
            {
              __typename: "Field",
              id: "3934ce8e-5513-4881-adbc-1f63e0bab17b",
              type: "UUID",
              name: "taskId",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Task id (foreign key)",
              description: "Event task id foreign key"
            },
            {
              __typename: "Field",
              id: "6741f8e9-5189-492f-91bd-2956c5902ec8",
              type: "RELATION",
              name: "task",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Task",
              description: "Event task",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "282f54c2-a8ee-498b-a740-28acc55ab8f3",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "417786ec-7358-4019-b72b-6002551ed5e8",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "6741f8e9-5189-492f-91bd-2956c5902ec8",
                  name: "task"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "18ff5583-7593-422c-abea-ced0195e281d",
                  nameSingular: "task",
                  namePlural: "tasks"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "790b0fb4-291f-49ff-a180-1af3e36dbe78",
                  name: "timelineActivities"
                }
              }
            },
            {
              __typename: "Field",
              id: "b4300d10-c356-4b06-9a0e-aa206b39c56b",
              type: "UUID",
              name: "workflowId",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Workflow id (foreign key)",
              description: "Event workflow id foreign key"
            },
            {
              __typename: "Field",
              id: "fa45ab2b-e079-408f-b927-475f9810ed00",
              type: "RELATION",
              name: "workflow",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Workflow",
              description: "Event workflow",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "b358c621-6e8f-41f9-983a-b9f720168122",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "417786ec-7358-4019-b72b-6002551ed5e8",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "fa45ab2b-e079-408f-b927-475f9810ed00",
                  name: "workflow"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "18d91fb4-c535-425e-8ff7-fb68394dfbf5",
                  nameSingular: "workflow",
                  namePlural: "workflows"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "a7185d4f-43d6-448f-a5a6-58b38df6bab1",
                  name: "timelineActivities"
                }
              }
            },
            {
              __typename: "Field",
              id: "313a19d0-20bb-4b25-bed5-0a853b2ecff0",
              type: "UUID",
              name: "workflowVersionId",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "WorkflowVersion id (foreign key)",
              description: "Event workflow version id foreign key"
            },
            {
              __typename: "Field",
              id: "e1d95b52-550a-465b-8e43-324bf25c6958",
              type: "RELATION",
              name: "workflowVersion",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "WorkflowVersion",
              description: "Event workflow version",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "db389c46-c137-406a-8525-bf5229d25be1",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "417786ec-7358-4019-b72b-6002551ed5e8",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "e1d95b52-550a-465b-8e43-324bf25c6958",
                  name: "workflowVersion"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "b38a7efd-b472-4b8e-8988-2b3fab3fe67f",
                  nameSingular: "workflowVersion",
                  namePlural: "workflowVersions"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "2f0d7a15-4962-4d8e-a30b-c70f0b5e23b7",
                  name: "timelineActivities"
                }
              }
            },
            {
              __typename: "Field",
              id: "58c6e1f2-d3f7-49c9-bad8-4df1f5eb94e9",
              type: "UUID",
              name: "workflowRunId",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Workflow Run id (foreign key)",
              description: "Event workflow run id foreign key"
            },
            {
              __typename: "Field",
              id: "01621d3a-5e97-4af9-ab78-a0461f32d322",
              type: "RELATION",
              name: "workflowRun",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Workflow Run",
              description: "Event workflow run",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "6b5f5e98-4000-4785-91b5-b4c33bdf105d",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "417786ec-7358-4019-b72b-6002551ed5e8",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "01621d3a-5e97-4af9-ab78-a0461f32d322",
                  name: "workflowRun"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "16c29a47-a565-4f4b-90c4-f1b52a32f234",
                  nameSingular: "workflowRun",
                  namePlural: "workflowRuns"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "d0c44ebf-b37f-4545-9dac-90a79ea2516e",
                  name: "timelineActivities"
                }
              }
            },
            {
              __typename: "Field",
              id: "f193caab-9c35-460f-89f1-f506ae7f727f",
              type: "RELATION",
              name: "pet",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.335Z",
              updatedAt: "2025-02-11T09:14:39.335Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Pet",
              description: "TimelineActivities Pet",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "329282e6-5d9c-4743-b451-f175deae0d5b",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "417786ec-7358-4019-b72b-6002551ed5e8",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "f193caab-9c35-460f-89f1-f506ae7f727f",
                  name: "pet"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "055c2349-c786-4389-b09d-09c89fc131bc",
                  nameSingular: "pet",
                  namePlural: "pets"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "878ab1b9-1ba2-47ad-9ec6-13552ff9750d",
                  name: "timelineActivities"
                }
              }
            },
            {
              __typename: "Field",
              id: "b2395861-2d8b-46e6-8f08-dcb793e5ed69",
              type: "UUID",
              name: "petId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.335Z",
              updatedAt: "2025-02-11T09:14:39.335Z",
              defaultValue: null,
              options: null,
              settings: {
                isForeignKey: true
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Pet ID (foreign key)",
              description: "Timeline Activity Pet id foreign key"
            },
            {
              __typename: "Field",
              id: "a13d4265-dfb7-4539-8ece-58516fc71bdf",
              type: "RELATION",
              name: "surveyResult",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.052Z",
              updatedAt: "2025-02-11T09:14:40.052Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Survey result",
              description: "TimelineActivities Survey result",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "192bd4e5-80a4-4314-9469-2be0c3b1d833",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "417786ec-7358-4019-b72b-6002551ed5e8",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "a13d4265-dfb7-4539-8ece-58516fc71bdf",
                  name: "surveyResult"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "3433f66e-e32c-4b99-b48b-38e6d23501cc",
                  nameSingular: "surveyResult",
                  namePlural: "surveyResults"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "62b29e8c-8274-48ed-a773-2a6f2c0c73d4",
                  name: "timelineActivities"
                }
              }
            },
            {
              __typename: "Field",
              id: "dda577fa-154e-49a6-b84e-7fa963fe8da1",
              type: "UUID",
              name: "surveyResultId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.052Z",
              updatedAt: "2025-02-11T09:14:40.052Z",
              defaultValue: null,
              options: null,
              settings: {
                isForeignKey: true
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Survey result ID (foreign key)",
              description: "Timeline Activity Survey result id foreign key"
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "7ca05c53-5f1f-4d4a-bd79-c69c79b15a9a",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_b292fe34a9e2d55884febd07e93",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "434b772d-8726-4bbc-bd4f-2725599fa42f",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "3934ce8e-5513-4881-adbc-1f63e0bab17b"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "95a3a8cf-6a02-4a6f-b3e6-48c3996738f0",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_2708a99873421942c99ab94da12",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "0f1bf825-c4e8-4782-a969-34a04ce68d70",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "b4300d10-c356-4b06-9a0e-aa206b39c56b"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "a722f778-7e09-4695-a7dd-de9245dccbb0",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_daf6592d1dff4cff3401bf23c67",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "db5bf254-4f14-4253-b451-472db37acfd6",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "a0c07a0d-3ec8-4ca5-9ce7-dfcf915ebdb4"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "027f6e55-29b2-40e7-8410-45392fd58a62",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_7e0d952730f13369e3bd9c2f1a9",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "65d589c7-d8cd-4fe6-a567-714d3258b503",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "4799159e-b21a-4cce-bce4-905f6b2dba86"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "bbc8e4bd-1f17-4bbd-97b3-560c499090af",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "fcaf92da-0539-42b4-88a5-baab2ce4e157"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "8a8e9aa6-ab38-4820-a2a5-117996fb943d",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_4e40a441ad75df16dd71499529a",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "f14a7522-93b6-481b-9e68-0053d4761eaf",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "313a19d0-20bb-4b25-bed5-0a853b2ecff0"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "7a6714d2-8d41-4c6b-9a1a-3a062c48e719",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "fcaf92da-0539-42b4-88a5-baab2ce4e157"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "0b647c1d-a5c0-4288-96a9-3e90d1555d4c",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_84b1e01cb0480e514a6e7ec0095",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "75d64a27-8d5f-4792-adf7-2fe06feeeb87",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "8fa91df6-a6b2-4248-ae7f-a83e96248524"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "c6334c03-6330-4a63-b132-482809287fd6",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "fcaf92da-0539-42b4-88a5-baab2ce4e157"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "e348ab95-33f4-4d49-8a52-eda8d6d4c74d",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_a98bc2277b52c6dd52303e52c21",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "814f16d9-7d90-4d90-9f67-a7571694e96e",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "45aa9838-0e7a-438c-bec2-6ad6aabf4daa"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "9fc0685c-c7ca-4a27-aa0c-877a66f60b55",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "fcaf92da-0539-42b4-88a5-baab2ce4e157"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "3d881a09-9305-4df4-92f4-07bc9523e112",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_6eae0c4202a87f812adf2f2ba6f",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "06e0d33c-35ea-40e3-b5e3-1716b16f0ebf",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "fcaf92da-0539-42b4-88a5-baab2ce4e157"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "2217dc3f-9ea3-4996-8796-088b5fb8b04e",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_a930d316a6b4f3b81d3f026dd16",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "5951894f-481f-4429-bbff-9444f693e64f",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "009e6914-a1b8-4f4e-9c36-b7a041998d77"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "36411ed2-cbfe-44d4-bab6-52148d4d4485",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "messageParticipant",
          namePlural: "messageParticipants",
          icon: "IconUserCircle",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "a325a92e-c357-43cd-9a9f-042bbb5f8cd0",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Message Participant",
          labelPlural: "Message Participants",
          description: "Message Participants",
          fieldsList: [
            {
              __typename: "Field",
              id: "de185b8f-faaf-4a35-82d8-5cb12e59d544",
              type: "SELECT",
              name: "role",
              icon: "IconAt",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'from'",
              options: [
                {
                  id: "7f4c9dd6-1ad8-441c-b200-66878c71271c",
                  color: "green",
                  label: "From",
                  value: "from",
                  position: 0
                },
                {
                  id: "cfa4c8f8-73e9-4313-a675-154620f852b6",
                  color: "blue",
                  label: "To",
                  value: "to",
                  position: 1
                },
                {
                  id: "dfaa0639-9ac8-4bf4-8d63-1d1dad7fceb8",
                  color: "orange",
                  label: "Cc",
                  value: "cc",
                  position: 2
                },
                {
                  id: "6fcd6de6-2288-4660-80a3-b48f8f520af0",
                  color: "red",
                  label: "Bcc",
                  value: "bcc",
                  position: 3
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Role",
              description: "Role"
            },
            {
              __typename: "Field",
              id: "a325a92e-c357-43cd-9a9f-042bbb5f8cd0",
              type: "TEXT",
              name: "handle",
              icon: "IconAt",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Handle",
              description: "Handle"
            },
            {
              __typename: "Field",
              id: "dd3b5a6c-86a0-4db2-9c92-3defd09b34af",
              type: "TEXT",
              name: "displayName",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Display Name",
              description: "Display Name"
            },
            {
              __typename: "Field",
              id: "c19d191f-e39d-4c70-b693-a60cb327d463",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "77eed1a2-5890-4025-989d-3209f9fa704d",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "2c3c393b-44da-4d1f-935b-3867fc8a80db",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "fb0909e3-0e45-40ac-a989-af2236e5f6a1",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "52112b56-2ebb-4c1f-867e-732e63368825",
              type: "UUID",
              name: "messageId",
              icon: "IconMessage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Message id (foreign key)",
              description: "Message id foreign key"
            },
            {
              __typename: "Field",
              id: "f94e6131-4976-405a-b570-0d9195624049",
              type: "RELATION",
              name: "message",
              icon: "IconMessage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Message",
              description: "Message",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "edd3a04a-b6f9-4b3f-9173-5e0b4a01c6fd",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "36411ed2-cbfe-44d4-bab6-52148d4d4485",
                  nameSingular: "messageParticipant",
                  namePlural: "messageParticipants"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "f94e6131-4976-405a-b570-0d9195624049",
                  name: "message"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "c1eec93b-e57f-4ae5-b51c-d0c33d6a4c02",
                  nameSingular: "message",
                  namePlural: "messages"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "79a59047-dd05-4e8d-abb3-c9fda7bb1222",
                  name: "messageParticipants"
                }
              }
            },
            {
              __typename: "Field",
              id: "1a83ef1e-3e37-44a6-a3fb-dd3696d09650",
              type: "UUID",
              name: "personId",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Person id (foreign key)",
              description: "Person id foreign key"
            },
            {
              __typename: "Field",
              id: "c4a59428-9163-4470-b1a8-26ca4a109b3f",
              type: "RELATION",
              name: "person",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Person",
              description: "Person",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "a322173d-9c7d-4780-bf93-9960189fd715",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "36411ed2-cbfe-44d4-bab6-52148d4d4485",
                  nameSingular: "messageParticipant",
                  namePlural: "messageParticipants"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "c4a59428-9163-4470-b1a8-26ca4a109b3f",
                  name: "person"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "49029f5c-50d8-41e7-b58c-4584ee54763f",
                  nameSingular: "person",
                  namePlural: "people"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "c11f28b1-68ee-4b28-b56d-194420bc8d1c",
                  name: "messageParticipants"
                }
              }
            },
            {
              __typename: "Field",
              id: "fc71229f-395d-420f-b256-8a27d19f2513",
              type: "UUID",
              name: "workspaceMemberId",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Workspace Member id (foreign key)",
              description: "Workspace member id foreign key"
            },
            {
              __typename: "Field",
              id: "e9336814-40bf-49d2-9c7e-dae6af9d077b",
              type: "RELATION",
              name: "workspaceMember",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Workspace Member",
              description: "Workspace member",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "032354ca-4473-4e89-8b6d-0b47c02b0638",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "36411ed2-cbfe-44d4-bab6-52148d4d4485",
                  nameSingular: "messageParticipant",
                  namePlural: "messageParticipants"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "e9336814-40bf-49d2-9c7e-dae6af9d077b",
                  name: "workspaceMember"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "c841d49e-6664-4008-80bc-905c5540671e",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "ac0efdd1-178e-47c1-a2f4-2add422b5718",
                  name: "messageParticipants"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "8e0a16c8-f92e-42f0-82df-5205c8327cab",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_8d0144e4074d86d0cb7094f40c2",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "8699ed66-c952-47b8-acb2-507fd2cfe7de",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "fb0909e3-0e45-40ac-a989-af2236e5f6a1"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "26567213-d415-4e85-a641-c222dffe8c62",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_8c4f617db0813d41aef587e49ea",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "3664300b-9a34-4da0-9cb3-dcad835f3375",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "fc71229f-395d-420f-b256-8a27d19f2513"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "bfa28767-52c1-439f-a1d1-e61316296a00",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "fb0909e3-0e45-40ac-a989-af2236e5f6a1"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "18a6a953-7d8e-46e8-8f6b-145f509e7d1e",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_6d9700e5ae2ab8c294d614e72f6",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "b0954d4f-a88d-4620-9242-fcf82b95390e",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "fb0909e3-0e45-40ac-a989-af2236e5f6a1"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "10592ba2-694a-4a8a-846f-2b6a8ee29068",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "1a83ef1e-3e37-44a6-a3fb-dd3696d09650"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "3433f66e-e32c-4b99-b48b-38e6d23501cc",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "surveyResult",
          namePlural: "surveyResults",
          icon: "IconRulerMeasure",
          isCustom: true,
          isRemote: false,
          isActive: true,
          isSystem: false,
          isSearchable: true,
          createdAt: "2025-02-11T09:14:40.039Z",
          updatedAt: "2025-02-11T09:14:40.043Z",
          labelIdentifierFieldMetadataId: "5bdf1a3a-986b-48d0-87c4-8fa683f005f3",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Survey result",
          labelPlural: "Survey results",
          description: null,
          fieldsList: [
            {
              __typename: "Field",
              id: "b5f3ac59-dc01-4f51-a9b8-d921adecb78d",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.051Z",
              updatedAt: "2025-02-11T09:14:40.051Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Favorites",
              description: "Favorites tied to the Survey result",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "232846d1-ca1e-41a4-97a3-fdf6431aa572",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "3433f66e-e32c-4b99-b48b-38e6d23501cc",
                  nameSingular: "surveyResult",
                  namePlural: "surveyResults"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "b5f3ac59-dc01-4f51-a9b8-d921adecb78d",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "c081018d-9287-4bce-9b14-75b47b6ef6a4",
                  name: "surveyResult"
                }
              }
            },
            {
              __typename: "Field",
              id: "ff3bb487-ad47-469e-a1ac-c483bca36b79",
              type: "RELATION",
              name: "noteTargets",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.052Z",
              updatedAt: "2025-02-11T09:14:40.052Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "NoteTargets",
              description: "NoteTargets tied to the Survey result",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "5ec3cb38-9988-4c02-8652-3d3da682a342",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "3433f66e-e32c-4b99-b48b-38e6d23501cc",
                  nameSingular: "surveyResult",
                  namePlural: "surveyResults"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "ff3bb487-ad47-469e-a1ac-c483bca36b79",
                  name: "noteTargets"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "e17eb8fc-5ba9-4479-9c76-f731f8584a9a",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "ba3ef494-ed06-406e-8fba-adef99807abb",
                  name: "surveyResult"
                }
              }
            },
            {
              __typename: "Field",
              id: "54fec671-deed-4e81-8076-0c028fb80643",
              type: "TS_VECTOR",
              name: "searchVector",
              icon: null,
              isCustom: false,
              isActive: false,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.062Z",
              updatedAt: "2025-02-11T09:14:40.062Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Search vector",
              description: "Field used for full-text search"
            },
            {
              __typename: "Field",
              id: "d3ec189d-b667-4e65-8da3-f6c75ff5747f",
              type: "NUMBER",
              name: "score",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.439Z",
              updatedAt: "2025-02-11T09:14:40.439Z",
              defaultValue: null,
              options: null,
              settings: {
                type: "number",
                dataType: "float",
                decimals: 3
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Score (Float 3 decimals)",
              description: ""
            },
            {
              __typename: "Field",
              id: "8c9d88da-3fcb-464a-8cae-0c43490e561d",
              type: "NUMBER",
              name: "percentageOfCompletion",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.442Z",
              updatedAt: "2025-02-11T09:14:40.442Z",
              defaultValue: null,
              options: null,
              settings: {
                type: "percentage",
                dataType: "float",
                decimals: 6
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Percentage of completion (Float 3 decimals + percentage)",
              description: ""
            },
            {
              __typename: "Field",
              id: "775e3ee5-9b9a-4348-a8f1-022b0592ceff",
              type: "NUMBER",
              name: "participants",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.445Z",
              updatedAt: "2025-02-11T09:14:40.445Z",
              defaultValue: null,
              options: null,
              settings: {
                type: "number",
                dataType: "int"
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Participants (Int)",
              description: ""
            },
            {
              __typename: "Field",
              id: "03eab42f-51b3-4a10-b1b4-bd5a9426663d",
              type: "NUMBER",
              name: "averageEstimatedNumberOfAtomsInTheUniverse",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.447Z",
              updatedAt: "2025-02-11T09:14:40.447Z",
              defaultValue: null,
              options: null,
              settings: {
                type: "number",
                dataType: "bigint"
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Average estimated number of atoms in the universe (BigInt)",
              description: ""
            },
            {
              __typename: "Field",
              id: "94253667-683f-4739-b11f-99d34696e8be",
              type: "TEXT",
              name: "comments",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.450Z",
              updatedAt: "2025-02-11T09:14:40.450Z",
              defaultValue: "''",
              options: null,
              settings: {
                displayedMaxRows: 5
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Comments (Max 5 rows)",
              description: ""
            },
            {
              __typename: "Field",
              id: "26c588ad-6c88-47d6-afa5-67caaf7bd8a5",
              type: "TEXT",
              name: "shortNotes",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.452Z",
              updatedAt: "2025-02-11T09:14:40.452Z",
              defaultValue: "''",
              options: null,
              settings: {
                displayedMaxRows: 1
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Short notes (Max 1 row)",
              description: ""
            },
            {
              __typename: "Field",
              id: "12aff23b-8589-488a-8cf2-e17634dfd883",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.039Z",
              updatedAt: "2025-02-11T09:14:40.039Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "5bdf1a3a-986b-48d0-87c4-8fa683f005f3",
              type: "TEXT",
              name: "name",
              icon: "IconAbc",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.039Z",
              updatedAt: "2025-02-11T09:14:40.039Z",
              defaultValue: "'Untitled'",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Name",
              description: "Name"
            },
            {
              __typename: "Field",
              id: "794078cc-7e3c-437b-bb0d-13126167b265",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.039Z",
              updatedAt: "2025-02-11T09:14:40.039Z",
              defaultValue: "now",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "d2ff6dbb-689e-40ab-b49c-4244c47d1bfb",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.039Z",
              updatedAt: "2025-02-11T09:14:40.039Z",
              defaultValue: "now",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "d4d0d14f-d8f1-4007-a356-2c210a83f334",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.039Z",
              updatedAt: "2025-02-11T09:14:40.039Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Deletion date"
            },
            {
              __typename: "Field",
              id: "65d1ce59-65f4-40eb-8338-df0b682ba941",
              type: "ACTOR",
              name: "createdBy",
              icon: "IconCreativeCommonsSa",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.039Z",
              updatedAt: "2025-02-11T09:14:40.039Z",
              defaultValue: {
                name: "''",
                source: "'MANUAL'"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Created by",
              description: "The creator of the record"
            },
            {
              __typename: "Field",
              id: "5539159c-244b-433f-ac68-739e446dc0c1",
              type: "POSITION",
              name: "position",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.039Z",
              updatedAt: "2025-02-11T09:14:40.039Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Position",
              description: "Position"
            },
            {
              __typename: "Field",
              id: "5082fea5-d4a1-4ff2-adfc-9f2ed99d958a",
              type: "RELATION",
              name: "attachments",
              icon: "IconFileImport",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.051Z",
              updatedAt: "2025-02-11T09:14:40.051Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Attachments",
              description: "Attachments tied to the Survey result",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "f8718732-b97f-478e-b748-f6854ca59f8a",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "3433f66e-e32c-4b99-b48b-38e6d23501cc",
                  nameSingular: "surveyResult",
                  namePlural: "surveyResults"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "5082fea5-d4a1-4ff2-adfc-9f2ed99d958a",
                  name: "attachments"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "b488fc13-032b-434c-acc9-a1b1cd9ad0d1",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "33f6f21c-70fb-4952-a81b-7a9a0652e273",
                  name: "surveyResult"
                }
              }
            },
            {
              __typename: "Field",
              id: "86bbe7f3-8480-4c5c-9eed-3168a563176c",
              type: "RELATION",
              name: "taskTargets",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.051Z",
              updatedAt: "2025-02-11T09:14:40.051Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "TaskTargets",
              description: "TaskTargets tied to the Survey result",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "748f0c32-6bc4-4bef-9b07-c722989613d7",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "3433f66e-e32c-4b99-b48b-38e6d23501cc",
                  nameSingular: "surveyResult",
                  namePlural: "surveyResults"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "86bbe7f3-8480-4c5c-9eed-3168a563176c",
                  name: "taskTargets"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "6b82ae18-f0ee-4d8a-bf82-b7b1344b6109",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "c0103f7e-0357-40d6-8c08-7aa1b0716f4a",
                  name: "surveyResult"
                }
              }
            },
            {
              __typename: "Field",
              id: "62b29e8c-8274-48ed-a773-2a6f2c0c73d4",
              type: "RELATION",
              name: "timelineActivities",
              icon: "IconTimelineEvent",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:40.052Z",
              updatedAt: "2025-02-11T09:14:40.052Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "TimelineActivities",
              description: "TimelineActivities tied to the Survey result",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "192bd4e5-80a4-4314-9469-2be0c3b1d833",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "3433f66e-e32c-4b99-b48b-38e6d23501cc",
                  nameSingular: "surveyResult",
                  namePlural: "surveyResults"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "62b29e8c-8274-48ed-a773-2a6f2c0c73d4",
                  name: "timelineActivities"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "417786ec-7358-4019-b72b-6002551ed5e8",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "a13d4265-dfb7-4539-8ece-58516fc71bdf",
                  name: "surveyResult"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "4c7254e6-df11-41fe-9205-055d7e876e4d",
                  createdAt: "2025-02-11T09:14:40.069Z",
                  updatedAt: "2025-02-11T09:14:40.069Z",
                  name: "IDX_e2a25535adda4544be555d3b6d8",
                  indexWhereClause: null,
                  indexType: "GIN",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "13b4705a-372a-48f1-ac41-82f03b975730",
                          createdAt: "2025-02-11T09:14:40.069Z",
                          updatedAt: "2025-02-11T09:14:40.069Z",
                          order: 0,
                          fieldMetadataId: "54fec671-deed-4e81-8076-0c028fb80643"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "2b5c2cc9-75ea-499f-b7e2-5d86c0f86bfb",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "apiKey",
          namePlural: "apiKeys",
          icon: "IconRobot",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "84cc32f8-52cf-4988-873d-43860a6ca370",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "API Key",
          labelPlural: "API Keys",
          description: "An API key",
          fieldsList: [
            {
              __typename: "Field",
              id: "891c39c0-d513-4720-adeb-936b6ad9c49e",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "84cc32f8-52cf-4988-873d-43860a6ca370",
              type: "TEXT",
              name: "name",
              icon: "IconLink",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Name",
              description: "ApiKey name"
            },
            {
              __typename: "Field",
              id: "ac48eeb2-9ba1-4a54-be1c-8467cfaf913d",
              type: "DATE_TIME",
              name: "expiresAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Expiration date",
              description: "ApiKey expiration date"
            },
            {
              __typename: "Field",
              id: "73caff91-3991-4db0-af0f-2bd1aef6f8a6",
              type: "DATE_TIME",
              name: "revokedAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Revocation date",
              description: "ApiKey revocation date"
            },
            {
              __typename: "Field",
              id: "6bcd0d94-c0ee-4f67-bcbf-08ee2592b9a4",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "0968d4ed-e7c1-4814-9bab-9169ced5e159",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "98f3c144-630e-4aa9-a9fc-6d14dca3b5aa",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: []
          }
        }
      },
      {
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "1cfe488b-b2fa-4217-849e-41ed3b1ea2cd",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "viewField",
          namePlural: "viewFields",
          icon: "IconTag",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "43b566c4-0d50-47c8-818a-b2b0475181a4",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "View Field",
          labelPlural: "View Fields",
          description: "(System) View Fields",
          fieldsList: [
            {
              __typename: "Field",
              id: "72893c4e-67f4-4f5d-a203-7aee5ce50f2b",
              type: "UUID",
              name: "fieldMetadataId",
              icon: "IconTag",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Field Metadata Id",
              description: "View Field target field"
            },
            {
              __typename: "Field",
              id: "242a3f46-61d1-4496-a197-413fd9d840a3",
              type: "BOOLEAN",
              name: "isVisible",
              icon: "IconEye",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: true,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Visible",
              description: "View Field visibility"
            },
            {
              __typename: "Field",
              id: "6af0e403-4248-4c08-b992-3ff7474dafe0",
              type: "NUMBER",
              name: "size",
              icon: "IconEye",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Size",
              description: "View Field size"
            },
            {
              __typename: "Field",
              id: "2f1d9771-76ad-4d46-8bf5-e20388be6929",
              type: "NUMBER",
              name: "position",
              icon: "IconList",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Position",
              description: "View Field position"
            },
            {
              __typename: "Field",
              id: "dac643ec-a6fc-45d5-b0d9-582df25a05ed",
              type: "SELECT",
              name: "aggregateOperation",
              icon: "IconCalculator",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: [
                {
                  id: "bf8d4235-336c-49f2-bf2d-7a45f3fa3699",
                  color: "red",
                  label: "Average",
                  value: "AVG",
                  position: 0
                },
                {
                  id: "75640829-aefe-47a2-abeb-8c58d214aa4d",
                  color: "purple",
                  label: "Count",
                  value: "COUNT",
                  position: 1
                },
                {
                  id: "ce252556-95be-4661-9868-edb5bf552957",
                  color: "sky",
                  label: "Maximum",
                  value: "MAX",
                  position: 2
                },
                {
                  id: "79424b54-c54e-43b2-a235-c2f941ac86a7",
                  color: "turquoise",
                  label: "Minimum",
                  value: "MIN",
                  position: 3
                },
                {
                  id: "b937bdd7-9624-4ee3-8478-c59930140e2c",
                  color: "yellow",
                  label: "Sum",
                  value: "SUM",
                  position: 4
                },
                {
                  id: "1ee90cab-0ded-41d7-8e81-dafc01f5659f",
                  color: "red",
                  label: "Count empty",
                  value: "COUNT_EMPTY",
                  position: 5
                },
                {
                  id: "3e86d44d-1620-4a84-ba3c-b59fac116c03",
                  color: "purple",
                  label: "Count not empty",
                  value: "COUNT_NOT_EMPTY",
                  position: 6
                },
                {
                  id: "c8d8d38d-58e4-4f43-86f5-5d92059db83a",
                  color: "sky",
                  label: "Count unique values",
                  value: "COUNT_UNIQUE_VALUES",
                  position: 7
                },
                {
                  id: "93e39346-5b2c-448c-923b-e0b075e0b54a",
                  color: "turquoise",
                  label: "Percent empty",
                  value: "PERCENTAGE_EMPTY",
                  position: 8
                },
                {
                  id: "33e33853-7117-4009-b4d5-11ddbbac0b8d",
                  color: "yellow",
                  label: "Percent not empty",
                  value: "PERCENTAGE_NOT_EMPTY",
                  position: 9
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Aggregate operation",
              description: "Optional aggregate operation"
            },
            {
              __typename: "Field",
              id: "43b566c4-0d50-47c8-818a-b2b0475181a4",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "f016edb9-5e65-4206-a94a-931eb001df80",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "727e62f0-95ce-4878-9307-40af4bfd15f2",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "a47f6b43-1ccc-46a7-ace3-130ee6ee7247",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "24c3b573-8ff9-468d-8bea-f9de211f852d",
              type: "UUID",
              name: "viewId",
              icon: "IconLayoutCollage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "View id (foreign key)",
              description: "View Field related view id foreign key"
            },
            {
              __typename: "Field",
              id: "c47887a9-10a3-42ad-a48f-42c465e835e0",
              type: "RELATION",
              name: "view",
              icon: "IconLayoutCollage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "View",
              description: "View Field related view",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "c610eb39-51f8-4448-a267-5ddd335da103",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "1cfe488b-b2fa-4217-849e-41ed3b1ea2cd",
                  nameSingular: "viewField",
                  namePlural: "viewFields"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "c47887a9-10a3-42ad-a48f-42c465e835e0",
                  name: "view"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "ded05363-70e6-4a88-95f3-ce04bb547dd2",
                  nameSingular: "view",
                  namePlural: "views"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "e083f601-68ca-4596-8f13-c309ec841f57",
                  name: "viewFields"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "927a992f-d0ca-4535-8767-7fa5df1a8e63",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_260f80ae1d2ccc67388995d6d05",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "49df30cc-221d-4457-b84b-8eca6698392f",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "a47f6b43-1ccc-46a7-ace3-130ee6ee7247"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "63e1cfa8-2680-4fb9-9092-92fe36bf9cf1",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_UNIQUE_6d269465206d2f3e283ce479b2e",
                  indexWhereClause: "\"deletedAt\" IS NULL",
                  indexType: "BTREE",
                  isUnique: true,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: []
                  }
                }
              }
            ]
          }
        }
      },
      {
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "18ff5583-7593-422c-abea-ced0195e281d",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "task",
          namePlural: "tasks",
          icon: "IconCheckbox",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: false,
          isSearchable: true,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "f9ef48ef-c0a1-49cc-ad51-35a4e2a8a6e0",
          imageIdentifierFieldMetadataId: null,
          shortcut: "T",
          isLabelSyncedWithName: false,
          labelSingular: "Task",
          labelPlural: "Tasks",
          description: "A task",
          fieldsList: [
            {
              __typename: "Field",
              id: "b321a3d3-7858-49b9-8878-673c816ee1a2",
              type: "POSITION",
              name: "position",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Position",
              description: "Task record position"
            },
            {
              __typename: "Field",
              id: "f9ef48ef-c0a1-49cc-ad51-35a4e2a8a6e0",
              type: "TEXT",
              name: "title",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Title",
              description: "Task title"
            },
            {
              __typename: "Field",
              id: "978c29e6-5be5-469c-b1c3-991247576e1d",
              type: "RICH_TEXT",
              name: "body",
              icon: "IconFilePencil",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Body",
              description: "Task body"
            },
            {
              __typename: "Field",
              id: "f4fd995c-2fc0-4ce3-970a-53e3ab02fd3d",
              type: "DATE_TIME",
              name: "dueAt",
              icon: "IconCalendarEvent",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Due Date",
              description: "Task due date"
            },
            {
              __typename: "Field",
              id: "a2080423-2322-4a2b-96c8-5dc68f0804e1",
              type: "SELECT",
              name: "status",
              icon: "IconCheck",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'TODO'",
              options: [
                {
                  id: "642da885-47fe-4c66-b5f5-c6f0d625bdc3",
                  color: "sky",
                  label: "To do",
                  value: "TODO",
                  position: 0
                },
                {
                  id: "46a35536-c51e-4aa8-9ff6-cad6129dd1e0",
                  color: "purple",
                  label: "In progress",
                  value: "IN_PROGRESS",
                  position: 1
                },
                {
                  id: "846dd859-62ca-4997-a202-0106a621a192",
                  color: "green",
                  label: "Done",
                  value: "DONE",
                  position: 1
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Status",
              description: "Task status"
            },
            {
              __typename: "Field",
              id: "b672975d-e3d0-4c74-9e3a-c8444ac3ec15",
              type: "ACTOR",
              name: "createdBy",
              icon: "IconCreativeCommonsSa",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: {
                name: "'System'",
                source: "'MANUAL'",
                context: {}
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Created by",
              description: "The creator of the record"
            },
            {
              __typename: "Field",
              id: "c6f9d5f3-74bf-4d40-a10b-9bd00fdb84fd",
              type: "TS_VECTOR",
              name: "searchVector",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Search vector",
              description: "Field used for full-text search"
            },
            {
              __typename: "Field",
              id: "ca09dc50-df0f-46e5-877d-614b2b5681d9",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "1c55db71-5673-4555-9f05-47e641f4f15b",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "0d8fc4eb-857b-4c24-890e-d16d4d15108e",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "76aaccbf-cea0-4a1c-9193-97be2ac35933",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "d616da2f-7e9c-46f1-b6cc-7bbb0cf52b99",
              type: "RELATION",
              name: "taskTargets",
              icon: "IconArrowUpRight",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Relations",
              description: "Task targets",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "1b6e98ac-770b-4d19-9f6e-78fe733b7d20",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "18ff5583-7593-422c-abea-ced0195e281d",
                  nameSingular: "task",
                  namePlural: "tasks"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "d616da2f-7e9c-46f1-b6cc-7bbb0cf52b99",
                  name: "taskTargets"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "6b82ae18-f0ee-4d8a-bf82-b7b1344b6109",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "e43067bc-42c6-4f02-8ffe-3773144180cc",
                  name: "task"
                }
              }
            },
            {
              __typename: "Field",
              id: "4e4e4d47-485a-48ac-9a4f-6fa085fbb527",
              type: "RELATION",
              name: "attachments",
              icon: "IconFileImport",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Attachments",
              description: "Task attachments",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "2b5943b4-d59b-4956-90c6-ffab27f7f8da",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "18ff5583-7593-422c-abea-ced0195e281d",
                  nameSingular: "task",
                  namePlural: "tasks"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "4e4e4d47-485a-48ac-9a4f-6fa085fbb527",
                  name: "attachments"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "b488fc13-032b-434c-acc9-a1b1cd9ad0d1",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "4299edc2-6b91-4886-aeb7-5a1d0de8d689",
                  name: "task"
                }
              }
            },
            {
              __typename: "Field",
              id: "88a2692b-1db6-434c-8ee1-1e606aacdefe",
              type: "UUID",
              name: "assigneeId",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Assignee id (foreign key)",
              description: "Task assignee id foreign key"
            },
            {
              __typename: "Field",
              id: "dcd46f0a-f631-43df-a474-ae72ce2b17dd",
              type: "RELATION",
              name: "assignee",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Assignee",
              description: "Task assignee",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "1ed21ca9-1005-4781-b70b-24ac933ad7d1",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "18ff5583-7593-422c-abea-ced0195e281d",
                  nameSingular: "task",
                  namePlural: "tasks"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "dcd46f0a-f631-43df-a474-ae72ce2b17dd",
                  name: "assignee"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "c841d49e-6664-4008-80bc-905c5540671e",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "7e5ed44b-6404-4aca-8af7-047ea149e7f0",
                  name: "assignedTasks"
                }
              }
            },
            {
              __typename: "Field",
              id: "790b0fb4-291f-49ff-a180-1af3e36dbe78",
              type: "RELATION",
              name: "timelineActivities",
              icon: "IconTimelineEvent",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Timeline Activities",
              description: "Timeline Activities linked to the task.",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "282f54c2-a8ee-498b-a740-28acc55ab8f3",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "18ff5583-7593-422c-abea-ced0195e281d",
                  nameSingular: "task",
                  namePlural: "tasks"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "790b0fb4-291f-49ff-a180-1af3e36dbe78",
                  name: "timelineActivities"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "417786ec-7358-4019-b72b-6002551ed5e8",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "6741f8e9-5189-492f-91bd-2956c5902ec8",
                  name: "task"
                }
              }
            },
            {
              __typename: "Field",
              id: "84949de2-f936-4623-9764-5ce4ed1274db",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Favorites",
              description: "Favorites linked to the task",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "ce24ceea-a777-4728-9a39-22595aed4142",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "18ff5583-7593-422c-abea-ced0195e281d",
                  nameSingular: "task",
                  namePlural: "tasks"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "84949de2-f936-4623-9764-5ce4ed1274db",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "d784ae0c-6262-43d7-9c26-da96b3e0d12f",
                  name: "task"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "c30c27f8-34ba-4590-9a91-be7b8e4832a2",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_ee5298b25512b38b29390e084f7",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "fd730461-5b37-4a53-9a6c-63079b62254f",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "88a2692b-1db6-434c-8ee1-1e606aacdefe"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "e778d275-4211-4414-bbf8-d2de516241f6",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "76aaccbf-cea0-4a1c-9193-97be2ac35933"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "052934bb-a197-444a-b59c-3dec4d6b9ee7",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_d01a000cf26e1225d894dc3d364",
                  indexWhereClause: null,
                  indexType: "GIN",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "2ca8a539-eb33-498a-a455-d6cdc419e948",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "c6f9d5f3-74bf-4d40-a10b-9bd00fdb84fd"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "18d91fb4-c535-425e-8ff7-fb68394dfbf5",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "workflow",
          namePlural: "workflows",
          icon: "IconSettingsAutomation",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: false,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "ed8938cf-bb8d-46a0-8f8c-1e2132978716",
          imageIdentifierFieldMetadataId: null,
          shortcut: "W",
          isLabelSyncedWithName: false,
          labelSingular: "Workflow",
          labelPlural: "Workflows",
          description: "A workflow",
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: []
          },
          fieldsList: [
            {
              __typename: "Field",
              id: "ed8938cf-bb8d-46a0-8f8c-1e2132978716",
              type: "TEXT",
              name: "name",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Name",
              description: "The workflow name"
            },
            {
              __typename: "Field",
              id: "ef69f60c-e8de-4751-931f-c8640db88d7b",
              type: "TEXT",
              name: "lastPublishedVersionId",
              icon: "IconVersions",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last published Version Id",
              description: "The workflow last published version id"
            },
            {
              __typename: "Field",
              id: "ad708ff9-6569-49db-ae9c-09dea5a4a71b",
              type: "MULTI_SELECT",
              name: "statuses",
              icon: "IconStatusChange",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: [
                {
                  color: "yellow",
                  label: "Draft",
                  value: "DRAFT",
                  position: 0
                },
                {
                  color: "green",
                  label: "Active",
                  value: "ACTIVE",
                  position: 1
                },
                {
                  color: "gray",
                  label: "Deactivated",
                  value: "DEACTIVATED",
                  position: 2
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Statuses",
              description: "The current statuses of the workflow versions"
            },
            {
              __typename: "Field",
              id: "97d227ba-e664-4775-8fca-47c10537b3f5",
              type: "POSITION",
              name: "position",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Position",
              description: "Workflow record position"
            },
            {
              __typename: "Field",
              id: "40920e84-5c23-45da-a7b0-3a0f131a79de",
              type: "ACTOR",
              name: "createdBy",
              icon: "IconCreativeCommonsSa",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: {
                name: "'System'",
                source: "'MANUAL'",
                context: {}
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Created by",
              description: "The creator of the record"
            },
            {
              __typename: "Field",
              id: "b3114abd-0789-4131-8008-7bacbaaf5891",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "2cc80f1d-0dc6-474c-b03c-c46a7c9f6dbf",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "af7e6b61-cf59-4a0b-a014-0edfa149824a",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "327e5c2f-c0ef-4557-b142-71aa5330e853",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "a3509a8d-887a-4dc2-a90a-901e6815ba6c",
              type: "RELATION",
              name: "versions",
              icon: "IconVersions",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Versions",
              description: "Workflow versions linked to the workflow.",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "3444601d-b206-4ce6-9678-8dd284bc5b57",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "18d91fb4-c535-425e-8ff7-fb68394dfbf5",
                  nameSingular: "workflow",
                  namePlural: "workflows"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "a3509a8d-887a-4dc2-a90a-901e6815ba6c",
                  name: "versions"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "b38a7efd-b472-4b8e-8988-2b3fab3fe67f",
                  nameSingular: "workflowVersion",
                  namePlural: "workflowVersions"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "b0ce1277-33e5-4375-884f-d0ec4d13aeb4",
                  name: "workflow"
                }
              }
            },
            {
              __typename: "Field",
              id: "c9ca0736-33bb-4b97-aad6-514c6adda4c5",
              type: "RELATION",
              name: "runs",
              icon: "IconRun",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Runs",
              description: "Workflow runs linked to the workflow.",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "626eb97d-542a-4fda-8e13-269aaeeb284d",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "18d91fb4-c535-425e-8ff7-fb68394dfbf5",
                  nameSingular: "workflow",
                  namePlural: "workflows"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "c9ca0736-33bb-4b97-aad6-514c6adda4c5",
                  name: "runs"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "16c29a47-a565-4f4b-90c4-f1b52a32f234",
                  nameSingular: "workflowRun",
                  namePlural: "workflowRuns"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "c963cfd5-96a9-4aae-96f9-146e0887cc75",
                  name: "workflow"
                }
              }
            },
            {
              __typename: "Field",
              id: "a2162b17-505f-4a9d-bf93-cbc06242a14c",
              type: "RELATION",
              name: "eventListeners",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Event Listeners",
              description: "Workflow event listeners linked to the workflow.",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "eda58ebf-dc0b-4481-b9a6-dafc80afdceb",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "18d91fb4-c535-425e-8ff7-fb68394dfbf5",
                  nameSingular: "workflow",
                  namePlural: "workflows"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "a2162b17-505f-4a9d-bf93-cbc06242a14c",
                  name: "eventListeners"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "8a943c8f-aceb-48a6-ac07-a0dca6712059",
                  nameSingular: "workflowEventListener",
                  namePlural: "workflowEventListeners"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "e43ec871-59cb-40ec-9384-53c4fd2bc5fb",
                  name: "workflow"
                }
              }
            },
            {
              __typename: "Field",
              id: "8a0f832b-bf17-4d66-8a44-e835c4d2030b",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Favorites",
              description: "Favorites linked to the workflow",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "81d32c05-6ca9-494f-a509-195868f7a492",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "18d91fb4-c535-425e-8ff7-fb68394dfbf5",
                  nameSingular: "workflow",
                  namePlural: "workflows"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "8a0f832b-bf17-4d66-8a44-e835c4d2030b",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "a0e396c3-a8cd-4934-82bc-7443862b4760",
                  name: "workflow"
                }
              }
            },
            {
              __typename: "Field",
              id: "a7185d4f-43d6-448f-a5a6-58b38df6bab1",
              type: "RELATION",
              name: "timelineActivities",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Timeline Activities",
              description: "Timeline activities linked to the workflow",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "b358c621-6e8f-41f9-983a-b9f720168122",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "18d91fb4-c535-425e-8ff7-fb68394dfbf5",
                  nameSingular: "workflow",
                  namePlural: "workflows"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "a7185d4f-43d6-448f-a5a6-58b38df6bab1",
                  name: "timelineActivities"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "417786ec-7358-4019-b72b-6002551ed5e8",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "fa45ab2b-e079-408f-b927-475f9810ed00",
                  name: "workflow"
                }
              }
            }
          ]
        }
      },
      {
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "16c29a47-a565-4f4b-90c4-f1b52a32f234",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "workflowRun",
          namePlural: "workflowRuns",
          icon: "IconSettingsAutomation",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: false,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "ed2a4301-ae23-41ad-85e7-04e7082c478e",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Workflow Run",
          labelPlural: "Workflow Runs",
          description: "A workflow run",
          fieldsList: [
            {
              __typename: "Field",
              id: "ed2a4301-ae23-41ad-85e7-04e7082c478e",
              type: "TEXT",
              name: "name",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Name",
              description: "Name of the workflow run"
            },
            {
              __typename: "Field",
              id: "ef79e13b-a107-4113-a0b0-60d62167043a",
              type: "DATE_TIME",
              name: "startedAt",
              icon: "IconHistory",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Workflow run started at",
              description: "Workflow run started at"
            },
            {
              __typename: "Field",
              id: "7a80ffc8-7360-496e-9e04-e9846491a4cd",
              type: "DATE_TIME",
              name: "endedAt",
              icon: "IconHistory",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Workflow run ended at",
              description: "Workflow run ended at"
            },
            {
              __typename: "Field",
              id: "fea45917-a8bf-47a2-885f-f92a0afee759",
              type: "SELECT",
              name: "status",
              icon: "IconStatusChange",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'NOT_STARTED'",
              options: [
                {
                  id: "deedc175-80d5-4819-8204-75fda525fbbd",
                  color: "gray",
                  label: "Not started",
                  value: "NOT_STARTED",
                  position: 0
                },
                {
                  id: "35032c1b-22ff-4990-ac60-10035941c56f",
                  color: "yellow",
                  label: "Running",
                  value: "RUNNING",
                  position: 1
                },
                {
                  id: "fd0873a6-4c80-48c4-8723-6f3032769f35",
                  color: "green",
                  label: "Completed",
                  value: "COMPLETED",
                  position: 2
                },
                {
                  id: "cd52417b-c38c-4591-9e65-6da54c7f02e3",
                  color: "red",
                  label: "Failed",
                  value: "FAILED",
                  position: 3
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Workflow run status",
              description: "Workflow run status"
            },
            {
              __typename: "Field",
              id: "02f8d810-34a7-44b3-b3b2-147f01a66b7e",
              type: "ACTOR",
              name: "createdBy",
              icon: "IconCreativeCommonsSa",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: {
                name: "'System'",
                source: "'MANUAL'",
                context: {}
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Executed by",
              description: "The executor of the workflow"
            },
            {
              __typename: "Field",
              id: "97a83f1d-2780-4214-96db-27ed59e8d6d3",
              type: "RAW_JSON",
              name: "output",
              icon: "IconText",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Output",
              description: "Json object to provide output of the workflow run"
            },
            {
              __typename: "Field",
              id: "4cfa7592-b41a-4810-9038-6569266f0051",
              type: "RAW_JSON",
              name: "context",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Context",
              description: "Context"
            },
            {
              __typename: "Field",
              id: "c92ee64d-31ef-4ce7-a1ff-808932d090ac",
              type: "POSITION",
              name: "position",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Position",
              description: "Workflow run position"
            },
            {
              __typename: "Field",
              id: "f1ee0bb2-7594-4bb8-b33f-23f841b23639",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "9c2128af-4f2c-44a9-aa39-c24e847ee033",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "fbf24ea6-e62d-401b-9510-86f3605b6b76",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "d5ac19dc-3138-43e1-b757-e56458efd47e",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "acf0aef7-12aa-4951-a92b-7bc5e15f0cbb",
              type: "UUID",
              name: "workflowVersionId",
              icon: "IconVersions",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Workflow version id (foreign key)",
              description: "Workflow version linked to the run. id foreign key"
            },
            {
              __typename: "Field",
              id: "dc394218-f576-42aa-8727-c4182de7f4a0",
              type: "RELATION",
              name: "workflowVersion",
              icon: "IconVersions",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Workflow version",
              description: "Workflow version linked to the run.",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "2d165a9b-3699-45fa-98cc-b9af92af5c51",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "16c29a47-a565-4f4b-90c4-f1b52a32f234",
                  nameSingular: "workflowRun",
                  namePlural: "workflowRuns"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "dc394218-f576-42aa-8727-c4182de7f4a0",
                  name: "workflowVersion"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "b38a7efd-b472-4b8e-8988-2b3fab3fe67f",
                  nameSingular: "workflowVersion",
                  namePlural: "workflowVersions"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "4a89f0cb-39b3-4532-94e7-b23bc35ef64f",
                  name: "runs"
                }
              }
            },
            {
              __typename: "Field",
              id: "83b5b594-e2c5-4792-acc9-f64205b1e8ee",
              type: "UUID",
              name: "workflowId",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Workflow id (foreign key)",
              description: "Workflow linked to the run. id foreign key"
            },
            {
              __typename: "Field",
              id: "c963cfd5-96a9-4aae-96f9-146e0887cc75",
              type: "RELATION",
              name: "workflow",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Workflow",
              description: "Workflow linked to the run.",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "626eb97d-542a-4fda-8e13-269aaeeb284d",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "16c29a47-a565-4f4b-90c4-f1b52a32f234",
                  nameSingular: "workflowRun",
                  namePlural: "workflowRuns"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "c963cfd5-96a9-4aae-96f9-146e0887cc75",
                  name: "workflow"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "18d91fb4-c535-425e-8ff7-fb68394dfbf5",
                  nameSingular: "workflow",
                  namePlural: "workflows"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "c9ca0736-33bb-4b97-aad6-514c6adda4c5",
                  name: "runs"
                }
              }
            },
            {
              __typename: "Field",
              id: "d0c9aa4a-6e28-4dc6-9892-a121d8f1d025",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Favorites",
              description: "Favorites linked to the workflow run",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "7bca5b31-61c6-4247-86cf-3eea0761f52d",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "16c29a47-a565-4f4b-90c4-f1b52a32f234",
                  nameSingular: "workflowRun",
                  namePlural: "workflowRuns"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "d0c9aa4a-6e28-4dc6-9892-a121d8f1d025",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "8d10d3da-66df-4cec-b165-1a83b80bb2f5",
                  name: "workflowRun"
                }
              }
            },
            {
              __typename: "Field",
              id: "d0c44ebf-b37f-4545-9dac-90a79ea2516e",
              type: "RELATION",
              name: "timelineActivities",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Timeline Activities",
              description: "Timeline activities linked to the run",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "6b5f5e98-4000-4785-91b5-b4c33bdf105d",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "16c29a47-a565-4f4b-90c4-f1b52a32f234",
                  nameSingular: "workflowRun",
                  namePlural: "workflowRuns"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "d0c44ebf-b37f-4545-9dac-90a79ea2516e",
                  name: "timelineActivities"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "417786ec-7358-4019-b72b-6002551ed5e8",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "01621d3a-5e97-4af9-ab78-a0461f32d322",
                  name: "workflowRun"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "b320a16e-c6c3-4911-ac10-eb85cdc680df",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_faa5772594c4ce15b9305919f2f",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: []
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "e2c9f863-dfdc-4406-a6b8-5f3fa02b2511",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_eee970874f46ff99eefc0015001",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "cefd82e6-e7e4-470d-91a5-ed6eb6943c9f",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "d5ac19dc-3138-43e1-b757-e56458efd47e"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "7b994a0a-694b-4fe6-9953-f6f59b0a32f4",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "83b5b594-e2c5-4792-acc9-f64205b1e8ee"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "075939c1-63ef-4dfa-8d13-31ce81049259",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "viewSort",
          namePlural: "viewSorts",
          icon: "IconArrowsSort",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "2df3fe9d-60af-46a9-917f-dec16c0a9c33",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "View Sort",
          labelPlural: "View Sorts",
          description: "(System) View Sorts",
          fieldsList: [
            {
              __typename: "Field",
              id: "c9caa1b3-87e0-4f2d-ab40-9f0af6cab0ce",
              type: "UUID",
              name: "fieldMetadataId",
              icon: "IconTag",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Field Metadata Id",
              description: "View Sort target field"
            },
            {
              __typename: "Field",
              id: "2d2eba3c-af1d-4d3d-b028-0b263339a5a9",
              type: "TEXT",
              name: "direction",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'asc'",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Direction",
              description: "View Sort direction"
            },
            {
              __typename: "Field",
              id: "2df3fe9d-60af-46a9-917f-dec16c0a9c33",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "8fcca7d6-8076-4e4c-855e-ff42a6870da2",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "2c06a0b5-df0f-4564-8394-e07202510b1c",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "57c0024d-6330-43dc-86fe-8c3ffaa0cce4",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "47fa3cd6-9d8e-4ca5-9e4b-8aa10ac078ef",
              type: "UUID",
              name: "viewId",
              icon: "IconLayoutCollage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "View id (foreign key)",
              description: "View Sort related view id foreign key"
            },
            {
              __typename: "Field",
              id: "aa369f3e-a729-4999-aeac-4fda1101752b",
              type: "RELATION",
              name: "view",
              icon: "IconLayoutCollage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "View",
              description: "View Sort related view",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "671ed16b-1aa8-4413-9594-5430537ed562",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "075939c1-63ef-4dfa-8d13-31ce81049259",
                  nameSingular: "viewSort",
                  namePlural: "viewSorts"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "aa369f3e-a729-4999-aeac-4fda1101752b",
                  name: "view"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "ded05363-70e6-4a88-95f3-ce04bb547dd2",
                  nameSingular: "view",
                  namePlural: "views"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "bc512167-35d3-42c9-a2e7-1ee07b2f2013",
                  name: "viewSorts"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "fdbdf4aa-51da-4b3e-8e18-f1cdff12b2e5",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_a01889a3e5b30d56447736329aa",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: []
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "5757e7b2-7346-4be6-bb6d-35da6f837f48",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_UNIQUE_9564690e029f3f186dff29c9c88",
                  indexWhereClause: "\"deletedAt\" IS NULL",
                  indexType: "BTREE",
                  isUnique: true,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "3f37d755-e1df-4ea2-a24b-71d34b663d60",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "47fa3cd6-9d8e-4ca5-9e4b-8aa10ac078ef"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "944e5d43-f86e-48d9-89db-bbe3206087a5",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "c9caa1b3-87e0-4f2d-ab40-9f0af6cab0ce"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "055c2349-c786-4389-b09d-09c89fc131bc",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "pet",
          namePlural: "pets",
          icon: "IconCat",
          isCustom: true,
          isRemote: false,
          isActive: true,
          isSystem: false,
          isSearchable: true,
          createdAt: "2025-02-11T09:14:39.321Z",
          updatedAt: "2025-02-11T09:14:39.327Z",
          labelIdentifierFieldMetadataId: "0c3bb20e-2d2d-4c1b-a1aa-5a44d7e55818",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Pet",
          labelPlural: "Pets",
          description: null,
          fieldsList: [
            {
              __typename: "Field",
              id: "5a595ace-7c91-4740-ab7c-e2b1b66d489e",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.335Z",
              updatedAt: "2025-02-11T09:14:39.335Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Favorites",
              description: "Favorites tied to the Pet",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "08f93709-2e7e-4878-9a5e-e4f1e67b0a3b",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "055c2349-c786-4389-b09d-09c89fc131bc",
                  nameSingular: "pet",
                  namePlural: "pets"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "5a595ace-7c91-4740-ab7c-e2b1b66d489e",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "96fd8b82-09c4-4caf-90bf-694904feb19e",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "db1a3dd5-0f72-4c6b-a8e3-91956ba6421e",
                  name: "pet"
                }
              }
            },
            {
              __typename: "Field",
              id: "8bb25e73-ea02-4fbd-a37e-7f216dd63eb9",
              type: "RELATION",
              name: "taskTargets",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.335Z",
              updatedAt: "2025-02-11T09:14:39.335Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "TaskTargets",
              description: "TaskTargets tied to the Pet",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "8e47bced-f608-4dc7-90a2-7ae7a7cf869c",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "055c2349-c786-4389-b09d-09c89fc131bc",
                  nameSingular: "pet",
                  namePlural: "pets"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "8bb25e73-ea02-4fbd-a37e-7f216dd63eb9",
                  name: "taskTargets"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "6b82ae18-f0ee-4d8a-bf82-b7b1344b6109",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "47a3e14b-dbbd-4c40-b3f5-f51412d8408e",
                  name: "pet"
                }
              }
            },
            {
              __typename: "Field",
              id: "5e47fe4c-df0d-4b12-98db-68a450fd7396",
              type: "RELATION",
              name: "noteTargets",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.335Z",
              updatedAt: "2025-02-11T09:14:39.335Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "NoteTargets",
              description: "NoteTargets tied to the Pet",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "d925935b-7152-41a1-8859-56e6544cb93c",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "055c2349-c786-4389-b09d-09c89fc131bc",
                  nameSingular: "pet",
                  namePlural: "pets"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "5e47fe4c-df0d-4b12-98db-68a450fd7396",
                  name: "noteTargets"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "e17eb8fc-5ba9-4479-9c76-f731f8584a9a",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "d80e2c74-31a0-43cc-b32f-394d260f837f",
                  name: "pet"
                }
              }
            },
            {
              __typename: "Field",
              id: "24feadce-321d-4192-9060-3879a0d27b23",
              type: "RELATION",
              name: "attachments",
              icon: "IconFileImport",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.335Z",
              updatedAt: "2025-02-11T09:14:39.335Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Attachments",
              description: "Attachments tied to the Pet",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "f61c9590-f432-4df8-90d0-98b2ad23ece5",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "055c2349-c786-4389-b09d-09c89fc131bc",
                  nameSingular: "pet",
                  namePlural: "pets"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "24feadce-321d-4192-9060-3879a0d27b23",
                  name: "attachments"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "b488fc13-032b-434c-acc9-a1b1cd9ad0d1",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "556e779d-fb1a-4bb7-80ab-fc80035b4933",
                  name: "pet"
                }
              }
            },
            {
              __typename: "Field",
              id: "23a6847f-127d-42fe-b546-9a70879d179f",
              type: "TS_VECTOR",
              name: "searchVector",
              icon: null,
              isCustom: false,
              isActive: false,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.346Z",
              updatedAt: "2025-02-11T09:14:39.346Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Search vector",
              description: "Field used for full-text search"
            },
            {
              __typename: "Field",
              id: "451890f0-b19d-4991-af09-9a4fa4d3d80b",
              type: "SELECT",
              name: "species",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.710Z",
              updatedAt: "2025-02-11T09:14:39.710Z",
              defaultValue: null,
              options: [
                {
                  id: "ba1761b9-48bf-44a6-a221-e0036f237080",
                  color: "blue",
                  label: "Dog",
                  value: "dog",
                  position: 0
                },
                {
                  id: "ec6b5484-6182-44a4-9b1a-ff26bcf6f315",
                  color: "red",
                  label: "Cat",
                  value: "cat",
                  position: 1
                },
                {
                  id: "6e4a4c35-9333-48e9-8fb1-e272d2a0b25c",
                  color: "green",
                  label: "Bird",
                  value: "bird",
                  position: 2
                },
                {
                  id: "1606befb-e894-47d9-9c85-e957cc167eeb",
                  color: "yellow",
                  label: "Fish",
                  value: "fish",
                  position: 3
                },
                {
                  id: "9acecd3b-f776-49c5-b4f0-85856f3663ee",
                  color: "purple",
                  label: "Rabbit",
                  value: "rabbit",
                  position: 4
                },
                {
                  id: "36048db0-b201-49ee-9b0e-d5796bc8ff72",
                  color: "orange",
                  label: "Hamster",
                  value: "hamster",
                  position: 5
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Species",
              description: ""
            },
            {
              __typename: "Field",
              id: "6f34fff8-3a3c-4d87-b239-083d7d6397c2",
              type: "MULTI_SELECT",
              name: "traits",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.713Z",
              updatedAt: "2025-02-11T09:14:39.713Z",
              defaultValue: null,
              options: [
                {
                  id: "c825bcb5-3f9d-422b-bb98-8e687c1cb878",
                  color: "blue",
                  label: "Playful",
                  value: "playful",
                  position: 0
                },
                {
                  id: "d46779a0-ced6-462e-b045-0441c531edba",
                  color: "red",
                  label: "Friendly",
                  value: "friendly",
                  position: 1
                },
                {
                  id: "615f5029-a62a-4537-87e8-57e7ad6ab994",
                  color: "green",
                  label: "Protective",
                  value: "protective",
                  position: 2
                },
                {
                  id: "ae83ba9d-9c88-49cd-b7ce-b5b8e350b00d",
                  color: "yellow",
                  label: "Shy",
                  value: "shy",
                  position: 3
                },
                {
                  id: "c382b32a-9cb9-46db-a464-79cbdcf49bdf",
                  color: "purple",
                  label: "Brave",
                  value: "brave",
                  position: 4
                },
                {
                  id: "071054b0-4f68-44f5-a8d5-6bc0d9bcd131",
                  color: "orange",
                  label: "Curious",
                  value: "curious",
                  position: 5
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Traits",
              description: ""
            },
            {
              __typename: "Field",
              id: "6b986d65-1a37-44ee-bc67-742ac71fa79c",
              type: "TEXT",
              name: "comments",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.715Z",
              updatedAt: "2025-02-11T09:14:39.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Comments",
              description: ""
            },
            {
              __typename: "Field",
              id: "3ace5962-b94c-4b77-a594-fc159839a077",
              type: "NUMBER",
              name: "age",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.716Z",
              updatedAt: "2025-02-11T09:14:39.716Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Age",
              description: ""
            },
            {
              __typename: "Field",
              id: "c6255b15-793c-4012-9e38-2ff37a45e0dc",
              type: "ADDRESS",
              name: "location",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.718Z",
              updatedAt: "2025-02-11T09:14:39.718Z",
              defaultValue: {
                addressLat: null,
                addressLng: null,
                addressCity: "''",
                addressState: "''",
                addressCountry: "''",
                addressStreet1: "''",
                addressStreet2: "''",
                addressPostcode: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Location",
              description: ""
            },
            {
              __typename: "Field",
              id: "ff8d39e0-adae-4fba-91c9-0859a3034f4e",
              type: "PHONES",
              name: "vetPhone",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.720Z",
              updatedAt: "2025-02-11T09:14:39.720Z",
              defaultValue: {
                additionalPhones: null,
                primaryPhoneNumber: "''",
                primaryPhoneCallingCode: "''",
                primaryPhoneCountryCode: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Vet phone",
              description: ""
            },
            {
              __typename: "Field",
              id: "60a5b08b-a493-49a3-9677-92109b86f70f",
              type: "EMAILS",
              name: "vetEmail",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.722Z",
              updatedAt: "2025-02-11T09:14:39.722Z",
              defaultValue: {
                primaryEmail: "''",
                additionalEmails: null
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Vet email",
              description: ""
            },
            {
              __typename: "Field",
              id: "a17addda-5fa4-4ba8-b6fa-094bb36c8e95",
              type: "DATE",
              name: "birthday",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.724Z",
              updatedAt: "2025-02-11T09:14:39.724Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Birthday",
              description: ""
            },
            {
              __typename: "Field",
              id: "b4442b4a-3efb-4164-81b9-39414206b465",
              type: "BOOLEAN",
              name: "isGoodWithKids",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.727Z",
              updatedAt: "2025-02-11T09:14:39.727Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Is good with kids",
              description: ""
            },
            {
              __typename: "Field",
              id: "cb5f3f29-38c5-48ca-96c3-fc2559dcabaf",
              type: "LINKS",
              name: "pictures",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.729Z",
              updatedAt: "2025-02-11T09:14:39.729Z",
              defaultValue: {
                primaryLinkUrl: "''",
                secondaryLinks: "'[]'",
                primaryLinkLabel: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Pictures",
              description: ""
            },
            {
              __typename: "Field",
              id: "d74c5f33-02f6-464b-80b4-53101636be05",
              type: "CURRENCY",
              name: "averageCostOfKibblePerMonth",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.731Z",
              updatedAt: "2025-02-11T09:14:39.731Z",
              defaultValue: {
                amountMicros: null,
                currencyCode: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Average cost of kibble per month",
              description: ""
            },
            {
              __typename: "Field",
              id: "7ab38fb7-20cb-4f7f-8675-1b53e6bb64f0",
              type: "FULL_NAME",
              name: "makesOwnerThinkOf",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.734Z",
              updatedAt: "2025-02-11T09:14:39.734Z",
              defaultValue: {
                lastName: "''",
                firstName: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Makes its owner think of",
              description: ""
            },
            {
              __typename: "Field",
              id: "d075065a-91a7-4a02-a87c-0ff6474a0c3b",
              type: "RATING",
              name: "soundSwag",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.736Z",
              updatedAt: "2025-02-11T09:14:39.736Z",
              defaultValue: null,
              options: [
                {
                  id: "5abc2a09-74a9-4aa9-9b64-743d20c37b0a",
                  label: "1",
                  value: "RATING_1",
                  position: 0
                },
                {
                  id: "f318039e-ca33-466a-85a9-4ba69a1dc6cc",
                  label: "2",
                  value: "RATING_2",
                  position: 1
                },
                {
                  id: "e4ef12e8-4427-4a32-9d01-53514283ea5f",
                  label: "3",
                  value: "RATING_3",
                  position: 2
                },
                {
                  id: "69924fb8-cbf1-4307-9fdf-59c4866b827f",
                  label: "4",
                  value: "RATING_4",
                  position: 3
                },
                {
                  id: "cc2ac6b3-e1f2-42e5-9b4e-7da9c60684b6",
                  label: "5",
                  value: "RATING_5",
                  position: 4
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Sound swag (bark style, meow style, etc.)",
              description: ""
            },
            {
              __typename: "Field",
              id: "ab2f5dbe-676e-4531-b2f6-8bfec31b332e",
              type: "RICH_TEXT",
              name: "bio",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.738Z",
              updatedAt: "2025-02-11T09:14:39.738Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Bio",
              description: ""
            },
            {
              __typename: "Field",
              id: "564e4a40-cb57-4be4-96d1-bd86caaaa1e8",
              type: "ARRAY",
              name: "interestingFacts",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.740Z",
              updatedAt: "2025-02-11T09:14:39.740Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Interesting facts",
              description: ""
            },
            {
              __typename: "Field",
              id: "70b8fc1a-ad05-448a-93b7-09796aa462c9",
              type: "RAW_JSON",
              name: "extraData",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.742Z",
              updatedAt: "2025-02-11T09:14:39.742Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Extra data",
              description: ""
            },
            {
              __typename: "Field",
              id: "6f50ab5b-1a2d-40d7-8197-69f9b6b473e8",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.321Z",
              updatedAt: "2025-02-11T09:14:39.321Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "0c3bb20e-2d2d-4c1b-a1aa-5a44d7e55818",
              type: "TEXT",
              name: "name",
              icon: "IconAbc",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.321Z",
              updatedAt: "2025-02-11T09:14:39.321Z",
              defaultValue: "'Untitled'",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Name",
              description: "Name"
            },
            {
              __typename: "Field",
              id: "38159d04-1473-43c9-9678-2ea0198135b1",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.321Z",
              updatedAt: "2025-02-11T09:14:39.321Z",
              defaultValue: "now",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "b9571145-1f8e-43aa-89b5-bfcce1f83be8",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.321Z",
              updatedAt: "2025-02-11T09:14:39.321Z",
              defaultValue: "now",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "20a3685f-ad7b-4e54-a1cd-fb750c5f3f7a",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.321Z",
              updatedAt: "2025-02-11T09:14:39.321Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Deletion date"
            },
            {
              __typename: "Field",
              id: "6c3d5ece-baf1-4200-8e73-863b14d096b2",
              type: "ACTOR",
              name: "createdBy",
              icon: "IconCreativeCommonsSa",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.321Z",
              updatedAt: "2025-02-11T09:14:39.321Z",
              defaultValue: {
                name: "''",
                source: "'MANUAL'"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Created by",
              description: "The creator of the record"
            },
            {
              __typename: "Field",
              id: "ac0d7835-7c0a-4ace-80ae-cb3ecddff68d",
              type: "POSITION",
              name: "position",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.321Z",
              updatedAt: "2025-02-11T09:14:39.321Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Position",
              description: "Position"
            },
            {
              __typename: "Field",
              id: "878ab1b9-1ba2-47ad-9ec6-13552ff9750d",
              type: "RELATION",
              name: "timelineActivities",
              icon: "IconTimelineEvent",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:39.335Z",
              updatedAt: "2025-02-11T09:14:39.335Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "TimelineActivities",
              description: "TimelineActivities tied to the Pet",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "329282e6-5d9c-4743-b451-f175deae0d5b",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "055c2349-c786-4389-b09d-09c89fc131bc",
                  nameSingular: "pet",
                  namePlural: "pets"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "878ab1b9-1ba2-47ad-9ec6-13552ff9750d",
                  name: "timelineActivities"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "417786ec-7358-4019-b72b-6002551ed5e8",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "f193caab-9c35-460f-89f1-f506ae7f727f",
                  name: "pet"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "325650a9-bd15-4c4a-8689-7b5c206c6c93",
                  createdAt: "2025-02-11T09:14:39.354Z",
                  updatedAt: "2025-02-11T09:14:39.354Z",
                  name: "IDX_82c02a6c94da4f260020dfb54b9",
                  indexWhereClause: null,
                  indexType: "GIN",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "ff899a3a-9daf-4018-82c5-3cafa079b3ab",
                          createdAt: "2025-02-11T09:14:39.354Z",
                          updatedAt: "2025-02-11T09:14:39.354Z",
                          order: 0,
                          fieldMetadataId: "23a6847f-127d-42fe-b546-9a70879d179f"
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
        __typename: "ObjectEdge",
        node: {
          __typename: "Object",
          id: "01e5d86a-6039-400a-8004-d9058c5eb2c7",
          dataSourceId: "f3e5fac0-7791-47d4-a2c2-087e584c67df",
          nameSingular: "messageChannelMessageAssociation",
          namePlural: "messageChannelMessageAssociations",
          icon: "IconMessage",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          isSearchable: false,
          createdAt: "2025-02-11T09:14:32.715Z",
          updatedAt: "2025-02-11T09:14:32.715Z",
          labelIdentifierFieldMetadataId: "251826b3-199d-44f8-93ce-5165f17701b3",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Message Channel Message Association",
          labelPlural: "Message Channel Message Associations",
          description: "Message Synced with a Message Channel",
          fieldsList: [
            {
              __typename: "Field",
              id: "a6eb28dd-2602-466c-85e5-b99a7555d710",
              type: "TEXT",
              name: "messageExternalId",
              icon: "IconHash",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Message External Id",
              description: "Message id from the messaging provider"
            },
            {
              __typename: "Field",
              id: "528a59a1-ac07-472e-a20a-023f3a4fa49a",
              type: "TEXT",
              name: "messageThreadExternalId",
              icon: "IconHash",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Thread External Id",
              description: "Thread id from the messaging provider"
            },
            {
              __typename: "Field",
              id: "9cc37326-6ece-4928-8842-18cdb643f5bf",
              type: "SELECT",
              name: "direction",
              icon: "IconDirection",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "'INCOMING'",
              options: [
                {
                  id: "b3ca6840-8185-4ef9-9066-07b61b3628e6",
                  color: "green",
                  label: "Incoming",
                  value: "INCOMING",
                  position: 0
                },
                {
                  id: "c4e5ce69-a274-4e28-a316-8c960d2f87e7",
                  color: "blue",
                  label: "Outgoing",
                  value: "OUTGOING",
                  position: 1
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Direction",
              description: "Message Direction"
            },
            {
              __typename: "Field",
              id: "251826b3-199d-44f8-93ce-5165f17701b3",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              __typename: "Field",
              id: "349bbdb6-c976-49da-a117-7fa9110afa89",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              __typename: "Field",
              id: "7b9e68a6-c0ff-4f80-8e0e-4d82f1dac09c",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              __typename: "Field",
              id: "e9ddf73b-79da-4698-bc58-54281eefa784",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: {
                displayFormat: 'RELATIVE'
              },
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              __typename: "Field",
              id: "d29f93dd-43fe-4f81-8ae8-8350b55deb32",
              type: "UUID",
              name: "messageChannelId",
              icon: "IconHash",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Message Channel Id id (foreign key)",
              description: "Message Channel Id id foreign key"
            },
            {
              __typename: "Field",
              id: "e20e3bd7-7e29-4eb6-8fe1-862ed69bcde4",
              type: "RELATION",
              name: "messageChannel",
              icon: "IconHash",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Message Channel Id",
              description: "Message Channel Id",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "2f5e3858-8121-4eec-9a9e-b8e9adea3510",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "01e5d86a-6039-400a-8004-d9058c5eb2c7",
                  nameSingular: "messageChannelMessageAssociation",
                  namePlural: "messageChannelMessageAssociations"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "e20e3bd7-7e29-4eb6-8fe1-862ed69bcde4",
                  name: "messageChannel"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "5deb0840-caf9-44ec-98be-8fcad3816c2f",
                  nameSingular: "messageChannel",
                  namePlural: "messageChannels"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "f7846b0f-6aad-4fff-be91-4f7978bf29ab",
                  name: "messageChannelMessageAssociations"
                }
              }
            },
            {
              __typename: "Field",
              id: "3ff32e8b-a5eb-45b8-976c-5fd6ea72b943",
              type: "UUID",
              name: "messageId",
              icon: "IconHash",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              relationDefinition: null,
              label: "Message Id id (foreign key)",
              description: "Message Id id foreign key"
            },
            {
              __typename: "Field",
              id: "0e3fa01d-bb7f-49d8-8f94-218120fabe70",
              type: "RELATION",
              name: "message",
              icon: "IconHash",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-11T09:14:32.715Z",
              updatedAt: "2025-02-11T09:14:32.715Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              label: "Message Id",
              description: "Message Id",
              relationDefinition: {
                __typename: "RelationDefinition",
                relationId: "d723373b-8971-45fa-ab0a-94eca9c15b76",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  __typename: "Object",
                  id: "01e5d86a-6039-400a-8004-d9058c5eb2c7",
                  nameSingular: "messageChannelMessageAssociation",
                  namePlural: "messageChannelMessageAssociations"
                },
                sourceFieldMetadata: {
                  __typename: "Field",
                  id: "0e3fa01d-bb7f-49d8-8f94-218120fabe70",
                  name: "message"
                },
                targetObjectMetadata: {
                  __typename: "Object",
                  id: "c1eec93b-e57f-4ae5-b51c-d0c33d6a4c02",
                  nameSingular: "message",
                  namePlural: "messages"
                },
                targetFieldMetadata: {
                  __typename: "Field",
                  id: "7d197dab-8498-4e68-9fa2-ca3839fbd678",
                  name: "messageChannelMessageAssociations"
                }
              }
            }
          ],
          indexMetadatas: {
            __typename: "ObjectIndexMetadatasConnection",
            edges: [
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "f37607d5-b463-4280-a8dc-833128f477ee",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_671dd9e01a80d1e4c89fc166c3b",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "105ec0c5-41c0-4eff-af97-af98c68bd3bc",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "3ff32e8b-a5eb-45b8-976c-5fd6ea72b943"
                        }
                      },
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "587d82df-7a6a-47a1-9411-a3e6341fe028",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 1,
                          fieldMetadataId: "e9ddf73b-79da-4698-bc58-54281eefa784"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "594410ea-50e9-40ee-9701-6fdb7b0ee6be",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_UNIQUE_da56d8b595a778d404eae01f29b",
                  indexWhereClause: "\"deletedAt\" IS NULL",
                  indexType: "BTREE",
                  isUnique: true,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "33225cb0-5285-46f3-a47a-54a467e571d1",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "d29f93dd-43fe-4f81-8ae8-8350b55deb32"
                        }
                      }
                    ]
                  }
                }
              },
              {
                __typename: "IndexEdge",
                node: {
                  __typename: "Index",
                  id: "b8b93c52-6e07-40a0-a051-1c6d3008f418",
                  createdAt: "2025-02-11T09:14:32.715Z",
                  updatedAt: "2025-02-11T09:14:32.715Z",
                  name: "IDX_63953e5f88351922043480b8801",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    __typename: "IndexIndexFieldMetadatasConnection",
                    edges: [
                      {
                        __typename: "IndexFieldEdge",
                        node: {
                          __typename: "IndexField",
                          id: "da75b8cd-c662-480f-b48e-dcbb67eb343d",
                          createdAt: "2025-02-11T09:14:32.715Z",
                          updatedAt: "2025-02-11T09:14:32.715Z",
                          order: 0,
                          fieldMetadataId: "d29f93dd-43fe-4f81-8ae8-8350b55deb32"
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
} as ObjectMetadataItemsQuery;
